// @flow
import type { UniNP } from './noun_phrases'
import type { Sexp } from '../types'

class UniIClause {
  agent:    UniNP
  verb:     string
  indirect: UniNP | void
  direct:   UniNP
  remove:   void | string
  negative: bool

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
  setRemove(remove:void|string): UniIClause {
    this.remove = remove
    return this
  }
  setNegative(negative:bool): UniIClause {
    this.negative = negative
    return this
  }
}

module.exports = { UniIClause }
