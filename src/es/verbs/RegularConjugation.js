// @flow
import type { Skill } from '../../types'

const { RegularConjugationPattern } = require('./regular_conjugation_pattern_table')

class RegularConjugation {
  infinitive: string
  pattern:    RegularConjugationPattern

  constructor(args:{| infinitive:string, pattern:RegularConjugationPattern |}) {
    this.infinitive = args.infinitive
    this.pattern    = args.pattern
  }

  words(): Array<string> {
    const stem = this.infinitive.substring(0, this.infinitive.length - 2) + '-'
    return [stem, this.pattern.suffix]
  }
  skills(): Array<[Skill,string]> {
    const stem = this.infinitive.substring(0, this.infinitive.length - 2)
    return []
      .concat([['prod-v-inf-' + this.infinitive, stem + '-']])
      .concat(this.pattern.skills())
  }
}

module.exports = RegularConjugation
