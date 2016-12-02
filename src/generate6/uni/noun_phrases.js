// @flow
import type { Sexp } from '../types'

const { UniIClause } = require('./uni_iclause')

class NounClause {
  type: 'that'
  iclause: UniIClause
  constructor(type:'that', iclause:UniIClause) {
    this.type    = type
    this.iclause = iclause
  }
}

export type NounPhrase = string | NounClause

module.exports = { NounClause }
