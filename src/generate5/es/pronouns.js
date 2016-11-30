// @flow
import type { Noun } from '../types'

type Per = 1 | 2 | 3

class EsPronouns {
  yo:     string|void
  recent: Array<string>

  constructor(args:{| yo?:string, recent?:Array<string> |}) {
    this.yo     = args.yo
    this.recent = (typeof args.recent === 'undefined') ? [] : args.recent
  }

  // returns [ person (1st, 3rd, etc.), isSpecific (vs ambiguous) ]
  lookup(noun:Noun): [Per, bool] {
    if (noun === this.yo) {
      return [1, true]
    } else {
      const isSpecific = (this.recent.length === 1 && this.recent[0] === noun)
      if (this.recent.indexOf(noun) === -1) {
        this.recent.push(noun)
      }
      return [3, isSpecific]
    }
  }
}

module.exports = { EsPronouns }
