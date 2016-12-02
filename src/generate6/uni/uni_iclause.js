// @flow
import type { UniNP } from './noun_phrases'
import type { Sexp } from '../types'

class UniIClause {
  agent:    UniNP
  verb:     string
  indirect: UniNP | void
  direct:   UniNP
  question: void | 'What'

  constructor(args:{|
    agent:     UniNP,
    verb:      string,
    indirect?: UniNP | void,
    direct:    UniNP,
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
