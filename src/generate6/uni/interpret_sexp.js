// @flow
import type { Sexp } from '../types'

const { IClause } = require('./iclause')
const { expectNoun, expectNounOrStatement, expectString, expectStatement } =
  require('../types')

function interpretSexp(sexp:Sexp): IClause {
  const verb   = expectString(sexp[0])
  const agent  = expectNoun(sexp[1], true)
  const direct = expectNoun(sexp[2], true) //expectNounOrStatement(sexp[2], true)
  return new IClause({ agent, verb, direct })
}

module.exports = { interpretSexp }
