// @flow
const { merge } = require('../merge')

class IClause {
  agent:    string
  verb:     string
  indirect: string | void
  direct:   string
  question: void | 'What'

  constructor(args:{| agent:string, verb:string, indirect?:string, direct:string |}) {
    this.agent    = args.agent
    this.verb     = args.verb
    this.indirect = args.indirect
    this.direct   = args.direct
  }
  setQuestion(question:'What') {
    return merge(this, { question })
  }
}

module.exports = { IClause }
