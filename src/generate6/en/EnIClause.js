// @flow
import type { EnNP } from './noun_phrases'
const EnPronoun        = require('./EnPronoun')
const { EnVerb } = require('./verbs')

class EnIClause {
  agent:           EnNP
  helpingVerb:     EnVerb|void
  mainVerb:        EnVerb
  indirect:        EnNP|void
  direct:          EnNP|void
  verbFirst:       bool

  constructor(args:{|
    agent:            EnNP,
    helpingVerb?:     EnVerb|void,
    mainVerb:         EnVerb,
    indirect?:        EnNP|void,
    direct?:          EnNP|void,
  |}) {
    this.agent           = args.agent
    this.helpingVerb     = args.helpingVerb
    this.mainVerb        = args.mainVerb
    this.indirect        = args.indirect
    this.direct          = args.direct
  }

  setVerbFirst(verbFirst:bool): EnIClause {
    this.verbFirst = verbFirst
    return this
  }

  words(): Array<string> {
    return []
      .concat(this.verbFirst && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.agent.words())
      .concat(!this.verbFirst && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.mainVerb.words())
      .concat(this.indirect !== undefined ? this.indirect.words() : [])
      .concat(this.direct !== undefined ? this.direct.words() : [])
  }
}

module.exports = EnIClause
