// @flow
import type { Sexp } from '../types'

const { IClause } = require('./iclause')
const { expectRef, expectString, expectStatement } = require('../types')

const ICLAUSE_VERBS = {
  ask:true,
  tell:true,
  command:true,
  want:true,
  need:true,
  have:true,
  give:true,
}

function interpretSexp(sexp:Sexp): IClause {
  const head  = expectString(sexp[0])
  if (ICLAUSE_VERBS[head]) {
    const verb   = head
    const agent  = expectRef(sexp[1], true)
    const direct = expectRef(sexp[2], true)
    return new IClause({ agent, verb, direct })
  } else if (head === 'what') {
    const statement = expectStatement(sexp[1])
    return interpretSexp(statement).setQuestion('What')
  } else {
    throw new Error("Unknown sexp head " + head)
  }
}

module.exports = { interpretSexp }
