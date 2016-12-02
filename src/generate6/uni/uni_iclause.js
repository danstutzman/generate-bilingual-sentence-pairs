// @flow
import type { NounPhrase } from './noun_phrases'
import type { Sexp } from '../types'

class UniIClause {
  agent:    NounPhrase
  verb:     string
  indirect: NounPhrase | void
  direct:   NounPhrase
  question: void | 'What'

  constructor(args:{|
    agent:     NounPhrase,
    verb:      string,
    indirect?: NounPhrase | void,
    direct:    NounPhrase,
  |}) {
    this.agent    = args.agent
    this.verb     = args.verb
    this.indirect = args.indirect
    this.direct   = args.direct
  }
  setQuestion(question:'What'): UniIClause {
    this.question = question
    return this
  }
}

module.exports = { UniIClause }
