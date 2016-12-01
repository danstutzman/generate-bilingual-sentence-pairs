// @flow

const { RegularConjugationPattern } = require('./regular_conjugation_pattern_table')

class RegularConjugation {
  infinitive: string
  pattern:    RegularConjugationPattern

  constructor(args:{| infinitive:string, pattern:RegularConjugationPattern |}) {
    this.infinitive = args.infinitive
    this.pattern    = args.pattern
  }

  words(): Array<string> {
    const stem = this.infinitive.substring(0,
      this.infinitive.length - this.pattern.suffix.length) + '-'
    return [stem, this.pattern.suffix]
  }
}

module.exports = RegularConjugation
