// @flow
import type { Noun } from '../types'

type Per = 1 | 2 | 3
type Num = 1 | 2

class EsPronouns {
  yo:     string|void
  recent: Array<string>

  constructor(args:{| yo?:string, recent?:Array<string> |}) {
    this.yo     = args.yo
    this.recent = (args.recent === undefined) ? [] : args.recent
  }

  // returns [ person (1st, 3rd, etc.), num (sing, pl), isSpecific (vs ambiguous) ]
  lookup(noun:Noun): [Per, Num, bool] {
    if (noun === this.yo) {
      return [1, 1, true]
    } else {
      const isSpecific = (this.recent.length === 1 && this.recent[0] === noun)
      if (this.recent.indexOf(noun) === -1) {
        this.recent.push(noun)
      }
      const num = {A:1, B:1, AA:2}[noun]
      if (num === undefined) {
        throw new Error("Don't know num of " + noun)
      }
      return [3, num, isSpecific]
    }
  }
}

module.exports = { EsPronouns }
