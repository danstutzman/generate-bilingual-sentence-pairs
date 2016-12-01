// @flow

class IClause {
  agent:  string
  verb:   string
  direct: string

  constructor(args:{| agent:string, verb:string, direct:string |}) {
    this.agent  = args.agent
    this.verb   = args.verb
    this.direct = args.direct
  }
}

module.exports = { IClause }
