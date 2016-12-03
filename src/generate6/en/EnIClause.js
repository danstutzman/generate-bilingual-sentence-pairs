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
  isVerbFirst:     bool

  constructor(args:{|
    agent:            EnNP,
    helpingVerb?:     EnVerb|void,
    mainVerb:         EnVerb,
    indirect?:        EnNP|void,
    direct?:          EnNP|void,
    isVerbFirst:      bool,
  |}) {
    this.agent           = args.agent
    this.helpingVerb     = args.helpingVerb
    this.mainVerb        = args.mainVerb
    this.indirect        = args.indirect
    this.direct          = args.direct
    this.isVerbFirst     = args.isVerbFirst
  }

  words(): Array<string> {
    return []
      .concat(this.isVerbFirst && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.agent.words())
      .concat(!this.isVerbFirst && this.helpingVerb !== undefined ?
        this.helpingVerb.words() : [])
      .concat(this.mainVerb.words())
      .concat(this.indirect !== undefined ? this.indirect.words() : [])
      .concat(this.direct !== undefined ? this.direct.words() : [])
  }
}

module.exports = EnIClause
