// @flow
import type { Sexp } from '../types'

const { UniIClause } = require('./uni_iclause')

class UniNClause {
  type: 'that'
  iclause: UniIClause
  constructor(type:'that', iclause:UniIClause) {
    this.type    = type
    this.iclause = iclause
  }
}

export type UniNP = string | UniNClause

module.exports = { UniNClause }
