// @flow
import type { Ref } from '../types'
import type { Gender, Person, Number, EsIdentity } from './types'

const { raise } = require('../raise')
const EsPronoun = require('./EsPronoun')

class EsPronouns {
  yo:       string | void
  tu:       string | void
  recent:   Array<string>

  constructor(args:{| yo?:string, tu?:string, recent?:Array<string> |}) {
    this.yo       = args.yo
    this.tu       = args.tu
    this.recent   = (args.recent === undefined) ? [] : args.recent
  }

  // 3rd return (bool) means isSpecific (no further words needed)
  lookupAgent(ref:Ref, refToIdentity:{[ref:string]:EsIdentity}): [Person, Number, bool] {
    if (ref === this.yo) {
      return [1, 1, true]
    } else if (ref === this.tu) {
      return [2, 1, true]
    } else {
      const [_, number, members] = refToIdentity[ref] ||
        raise(`Can't find EsIdentity for ${ref}`)
      if (this.yo && members.indexOf(this.yo) !== -1) {
        return [1, 2, true]
      }

      const isSpecific = (this.recent.length === 1 && this.recent[0] === ref)
      if (this.recent.indexOf(ref) === -1) {
        this.recent.push(ref)
      }
      return [3, number, isSpecific]
    }
  }

  lookupIndirectObj(indirectObj:Ref|void, agent:Ref|void,
      refToIdentity:{[ref:string]:EsIdentity}): [EsPronoun|void, bool] {
    if (indirectObj === undefined) {
      return [undefined, false]
    } else if (indirectObj === this.yo) {
      return [new EsPronoun('me'), true]
    } else if (indirectObj === this.tu) {
      return [new EsPronoun('te'), true]
    }

    const [gen, num, members] = refToIdentity[indirectObj] ||
      raise(`Can't find EsIdentity for ${indirectObj}`)
    if (this.yo && members.indexOf(this.yo) !== -1) {
      return [new EsPronoun('nos'), true]
    }

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agent) {
        // not confusable because we'd use reflexive for that
      } else {
        const [possibleGen, possibleNum] = refToIdentity[possibleRef] ||
          raise(`Can't find EsIdentity for ${possibleRef}`)
        if (possibleGen === gen && possibleNum === num) {
          possible.push(possibleRef)
        }
      }
    }

    const isSpecific = (possible.length === 1 && possible[0] === indirectObj)
    if (this.recent.indexOf(indirectObj) === -1) {
      this.recent.push(indirectObj)
    }

    if (isSpecific) {
      const pronoun:string = {
        '_1':'le', '_2':'les',
      }['_' + num] || raise("Can't find pronoun for '" + num + "'")
      return [new EsPronoun(pronoun), isSpecific]
    } else {
      return [undefined, false]
    }
  }

  lookupDirectObj(directObj:Ref, agent:Ref|void,
      refToIdentity:{[ref:string]:EsIdentity}): [EsPronoun|void, bool] {
    if (directObj === this.yo) {
      return [new EsPronoun('me'), true]
    } else if (directObj === this.tu) {
      return [new EsPronoun('te'), true]
    }

    const [gen, num, members] = refToIdentity[directObj] ||
      raise("Can't find preferred pronoun for " + directObj)
    if (this.yo && members.indexOf(this.yo) !== -1) {
      return [new EsPronoun('nos'), true]
    }

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agent) {
        // not confusable because we'd use reflexive for that
      } else {
        const [possibleGen, possibleNum] = refToIdentity[possibleRef] ||
          raise("Can't find preferred pronoun for " + possibleRef)
        if (possibleGen === gen && possibleNum === num) {
          possible.push(possibleRef)
        }
      }
    }

    const isSpecific = (possible.length === 1 && possible[0] === directObj)
    if (this.recent.indexOf(directObj) === -1) {
      this.recent.push(directObj)
    }

    if (isSpecific) {
      const pronoun:string = {
        '_M1':'lo', '_F1':'la', '_M2':'los', '_F2':'las',
      }['_' + gen + num] || raise("Can't find pronoun for '" + gen + num + "'")
      return [new EsPronoun(pronoun), isSpecific]
    } else {
      return [undefined, false]
    }
  }
}

module.exports = EsPronouns
