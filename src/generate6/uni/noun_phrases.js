// @flow
import type { Sexp } from '../types'

const { IClause } = require('./iclause')

class NounClause {
  type: 'that'
  iclause: IClause
  constructor(type:'that', iclause:IClause) {
    this.type    = type
    this.iclause = iclause
  }
}

export type NounPhrase = string | NounClause

module.exports = { NounClause }
