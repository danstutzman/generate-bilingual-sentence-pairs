// @flow
import type { Sexp } from '../types'

const { IClause } = require('./iclause')
const { expectRef, expectString, expectStatement } = require('../types')

function interpretSexp(sexp:Sexp): IClause {
  const verb   = expectString(sexp[0])
  const agent  = expectRef(sexp[1], true)
  const direct = expectRef(sexp[2], true)
  return new IClause({ agent, verb, direct })
}

module.exports = { interpretSexp }
