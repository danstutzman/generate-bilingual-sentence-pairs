// @flow
import type { Person, Tense, Number } from './types'

class EnVerb {
  _words: Array<string>
  constructor(_words: Array<string>) {
    this._words = _words
  }
  words(): Array<string> {
    return this._words
  }
}

const VERB_REQUIRES_ES = {
  'do':true,
  'go':true,
}

function conjugate(base:string, tense:Tense, person:Person,
    number:Number, negative:bool): EnVerb {
  if (negative) {
    if (base === 'do') {
      return (person === 3 && number === 1) ?
        new EnVerb(['does', "-n't"]) : new EnVerb(['do', "-n't"])
    } else {
      throw new Error(`Can't negate verb '${base}'`)
    }
  } else if (person === 3 && number === 1) { // e.g. "he goes"
    if (VERB_REQUIRES_ES[base]) {
      return new EnVerb([base, '-es'])
    } else {
      return new EnVerb([base, '-s'])
    }
  } else {
    return new EnVerb([base])
  }
}

module.exports = { conjugate, EnVerb }
