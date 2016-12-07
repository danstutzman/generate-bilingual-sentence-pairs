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

const UNIQUE_PAST_FORM = {
  'do':'did',
  'give':'gave',
  'have':'had',
}

function conjugate(base:string, tense:Tense, person:Person,
    number:Number, negative:bool): EnVerb {
  if (tense === 'pres') {
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
  } else if (tense === 'past') {
    if (negative) {
      if (base === 'do') {
        return new EnVerb(['did', "-n't"])
      } else {
        throw new Error(`Can't negate verb '${base}'`)
      }
    } else {
      const unique = UNIQUE_PAST_FORM[base]
      if (unique !== undefined) {
        return new EnVerb([unique])
      } else {
        return new EnVerb([base, '-ed'])
      }
    }
  } else {
    throw new Error(`Unknown tense '${tense}'`)
  }
}

module.exports = { conjugate, EnVerb }
