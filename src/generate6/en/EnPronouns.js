// @flow
import type { Ref } from '../types'
import type { Gender, Person, Number, EnIdentity } from './types'

const { raise } = require('../raise')
const EnPronoun = require('./EnPronoun')

class EnPronouns {
  me:     Ref | void
  you:    Ref | void
  recent: Array<string>

  constructor(args:{| me?:Ref, you?:Ref, recent?:Array<Ref> |}) {
    this.me     = args.me
    this.you    = args.you
    this.recent = (args.recent === undefined) ? [] : args.recent
  }

  lookup(ref:Ref, agentRef:Ref|void, nominative:bool,
      refToIdentity:{[ref:Ref]:EnIdentity}): [Person, Number, EnPronoun|void] {
    if (ref === this.me) {
      return [1, 1, nominative ? new EnPronoun('I') : new EnPronoun('me')]
    } else if (ref === this.you) {
      return [2, 1, new EnPronoun('you')]
    }

    const [gen, num, members] = refToIdentity[ref] ||
      raise(`Can't find EnIdentity for ${ref}`)
    if (this.me && members.indexOf(this.me) !== -1) {
      return [1, 2, new EnPronoun('we')]
    }

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agentRef && !nominative) {
        // not confusable because we'd use reflexive for that
      } else {
        const [possibleGen, possibleNum] = refToIdentity[possibleRef] ||
          raise(`Can't find EnIdentity for ${possibleRef}`)
        if (possibleGen === gen && possibleNum === num) {
          possible.push(possibleRef)
        }
      }
    }

    const isSpecific = (possible.length === 1 && possible[0] === ref)
    if (this.recent.indexOf(ref) === -1) {
      this.recent.push(ref)
    }

    if (isSpecific) {
      if (num === 2) {
        return [3, num, new EnPronoun('them')]
      } else if (gen === 'M') {
        return [3, num, new EnPronoun('him')]
      } else if (gen === 'F') {
        return [3, num, new EnPronoun('her')]
      } else if (gen === 'N') {
        return [3, num, new EnPronoun('it')]
      } else {
        throw new Error("Can't find pronoun for '" + gen + num + "'")
      }
    } else {
      return [3, num, undefined]
    }
  }
}

module.exports = EnPronouns
