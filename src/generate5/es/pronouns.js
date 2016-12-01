// @flow
import type { Noun } from '../types'

type Per = 1 | 2 | 3
type Num = 1 | 2
type Gen = 'M' | 'F' | '?'

function numOfNoun(noun:Noun): Num {
  const num = {A:1, B:1, AA:2, Libro:1, Pluma:1, What:1}[noun]
  if (num === undefined) {
    throw new Error("Don't know num of " + noun)
  }
  return num
}

function genOfNoun(noun:Noun): Gen {
  const gen = {A:'?', B:'?', AA:'?', Libro:'M', Pluma:'F', What:'?'}[noun]
  if (gen === undefined) {
    throw new Error("Don't know gen of " + noun)
  }
  return gen
}

class EsPronouns {
  yo:     string|void
  recent: Array<string>

  constructor(args:{| yo?:string, recent?:Array<string> |}) {
    this.yo     = args.yo
    this.recent = (args.recent === undefined) ? [] : args.recent
  }

  // 3rd return (bool) means isSpecific (no further words needed)
  lookupAgent(noun:Noun): [Per, Num, bool] {
    if (noun === this.yo) {
      return [1, 1, true]
    } else {
      const isSpecific = (this.recent.length === 1 && this.recent[0] === noun)
      if (this.recent.indexOf(noun) === -1) {
        this.recent.push(noun)
      }
      return [3, numOfNoun(noun), isSpecific]
    }
  }

  lookupDirectObj(directObj:Noun, agent:Noun): Array<string> {
    if (directObj === this.yo) {
      return ['me']
    } else {
      const num = numOfNoun(directObj)
      const gen = genOfNoun(directObj)

      const possible: Array<Noun> = []
      for (const possibleNoun of this.recent) {
        if (possibleNoun === agent) {
          // not confusable because we'd use reflexive for that
        } else if (numOfNoun(possibleNoun) === num && genOfNoun(possibleNoun) === gen) {
          possible.push(possibleNoun)
        }
      }

      const isSpecific = (possible.length === 1 && possible[0] === directObj)
      if (this.recent.indexOf(directObj) === -1) {
        this.recent.push(directObj)
      }

      let pronoun = []
      if (isSpecific) {
        pronoun = {
          _M1: ['lo'], _F1: ['la'],
        }['_' + gen + num] || ["Can't find pronoun for '" + gen + num + "'"]
      }
      return pronoun
    }
  }
}

module.exports = { EsPronouns }
