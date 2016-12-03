// @flow
import type { EnNPhrase } from './noun_phrases'
const EnPronoun        = require('./EnPronoun')
const { EnVerb } = require('./verbs')

class EnIClause {
  agent:           EnNPhrase
  question:        EnPronoun|void
  helpingVerb:     EnVerb|void
  mainVerb:        EnVerb
  indirect:        EnNPhrase|void
  direct:          EnNPhrase|void

  constructor(args:{|
    agent:            EnNPhrase,
    question?:        EnPronoun|void,
    helpingVerb?:     EnVerb|void,
    mainVerb:         EnVerb,
    indirect?:        EnNPhrase|void,
    direct?:          EnNPhrase|void,
  |}) {
    this.agent           = args.agent
    this.question        = args.question
    this.helpingVerb     = args.helpingVerb
    this.mainVerb        = args.mainVerb
    this.indirect        = args.indirect
    this.direct          = args.direct
  }

  words(): Array<string> {
    return []
      .concat(this.question !== undefined ? this.question.words() : [])
      .concat(this.question !== undefined && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.agent.words())
      .concat(this.question === undefined && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.mainVerb.words())
      .concat(this.indirect !== undefined ? this.indirect.words() : [])
      .concat(this.direct !== undefined ? this.direct.words() : [])
      .concat(this.question !== undefined ? ['?']: [])
  }
}

module.exports = EnIClause
