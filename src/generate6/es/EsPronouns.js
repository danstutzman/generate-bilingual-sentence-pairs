// @flow
import type { Ref } from '../types'
import type { Gender, Person, Number, PreferredPronouns } from './types'

const { raise } = require('../raise')
const EsPronoun = require('./EsPronoun')
const { preferenceToGenderNumber } = require('./types')

class EsPronouns {
  yo:       string | void
  tu:       string | void
  nosotros: string | void
  recent:   Array<string>

  constructor(args:{|
    yo?       : string,
    tu?       : string,
    nosotros? : string,
    recent?   : Array<string>,
  |}) {
    this.yo       = args.yo
    this.tu       = args.tu
    this.nosotros = args.nosotros
    this.recent   = (args.recent === undefined) ? [] : args.recent
  }

  // 3rd return (bool) means isSpecific (no further words needed)
  lookupAgent(ref:Ref, refToPreferredPronouns:{[ref: string]: PreferredPronouns}
      ): [Person, Number, bool] {
    if (ref === this.yo) {
      return [1, 1, true]
    } else if (ref === this.tu) {
      return [2, 1, true]
    } else if (ref === this.nosotros) {
      return [1, 2, true]
    } else {
      const isSpecific = (this.recent.length === 1 && this.recent[0] === ref)
      if (this.recent.indexOf(ref) === -1) {
        this.recent.push(ref)
      }
      const [_, number] = preferenceToGenderNumber(refToPreferredPronouns[ref] ||
        raise("Can't find preferred pronoun for " + ref))
      return [3, number, isSpecific]
    }
  }

  lookupIndirectObj(indirectObj:Ref|void, agent:Ref|void,
      refToPreferredPronouns:{[ref: string]: PreferredPronouns}): [EsPronoun|void, bool] {
    if (indirectObj === undefined) {
      return [undefined, false]
    } else if (indirectObj === this.yo) {
      return [new EsPronoun('me'), true]
    } else if (indirectObj === this.tu) {
      return [new EsPronoun('te'), true]
    } else if (indirectObj === this.nosotros) {
      return [new EsPronoun('nos'), true]
    }

    const [gen, num] = preferenceToGenderNumber(refToPreferredPronouns[indirectObj] ||
      raise("Can't find preferred pronoun for " + indirectObj))

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agent) {
        // not confusable because we'd use reflexive for that
      } else {
        const [possibleGen, possibleNum] = preferenceToGenderNumber(
          refToPreferredPronouns[possibleRef] ||
          raise("Can't find preferred pronoun for " + possibleRef))
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
      refToPreferredPronouns:{[ref: string]: PreferredPronouns}): [EsPronoun|void, bool] {
    if (directObj === this.yo) {
      return [new EsPronoun('me'), true]
    } else if (directObj === this.tu) {
      return [new EsPronoun('te'), true]
    } else if (directObj === this.nosotros) {
      return [new EsPronoun('nos'), true]
    }

    const [gen, num] = preferenceToGenderNumber(refToPreferredPronouns[directObj] ||
      raise("Can't find preferred pronoun for " + directObj))

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agent) {
        // not confusable because we'd use reflexive for that
      } else {
        const [possibleGen, possibleNum] = preferenceToGenderNumber(
          refToPreferredPronouns[possibleRef] ||
          raise("Can't find preferred pronoun for " + possibleRef))
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
