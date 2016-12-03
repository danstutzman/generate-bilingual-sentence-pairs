// @flow
import type { Ref } from '../types'
import type { Gender, Person, Number, PreferredPronouns } from './types'

const { raise } = require('../raise')
const EnPronoun = require('./EnPronoun')
const { preferenceToGenderNumber } = require('./types')

class EnPronouns {
  me:     Ref|void
  recent: Array<string>

  constructor(args:{| me?:Ref, recent?:Array<Ref> |}) {
    this.me     = args.me
    this.recent = (args.recent === undefined) ? [] : args.recent
  }

  lookup(ref:Ref, agentRef:Ref|void, nominative:bool,
      refToPreferredPronouns:{[ref: string]: PreferredPronouns}):
      [Person, Number, EnPronoun|void] {
    if (ref === this.me) {
      return [1, 1, nominative ? new EnPronoun('I') : new EnPronoun('me')]
    }

    const [gen, num] = preferenceToGenderNumber(refToPreferredPronouns[ref] ||
      raise("Can't find preferred pronoun for " + ref))

    const possible: Array<Ref> = []
    for (const possibleRef of this.recent) {
      if (possibleRef === agentRef && !nominative) {
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
