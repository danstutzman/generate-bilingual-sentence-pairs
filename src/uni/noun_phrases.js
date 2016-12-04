// @flow
import type { Sexp } from '../types'

const { UniIClause } = require('./uni_iclause')

const VALID_UNI_NCLAUSE_HEADS = { 'that':true, 'what':true, 'why':true }

class UniNClause {
  type:    string
  iclause: UniIClause
  isTop:   bool

  constructor(type:string, iclause:UniIClause, isTop:bool) {
    if (VALID_UNI_NCLAUSE_HEADS[type] === undefined) {
      throw new Error(`Invalid UniNClause type '${type}'`)
    }
    this.type    = type
    this.iclause = iclause
    this.isTop   = isTop
  }
}

export type UniNP = string | UniNClause

module.exports = { UniNClause, VALID_UNI_NCLAUSE_HEADS }
