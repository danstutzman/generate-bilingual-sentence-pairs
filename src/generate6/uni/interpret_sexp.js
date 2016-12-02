// @flow
import type { Ref, Sexp } from '../types'

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
    const agent:Ref = expectRef(sexp[1], true)
    let indirect:Ref|void
    let direct:Ref
    if (sexp.length === 3) {
      direct = expectRef(sexp[2], true)
    } else if (sexp.length === 4) {
      indirect = expectRef(sexp[2], true)
      direct = expectRef(sexp[3], true)
    } else {
      throw new Error("Unexpected size of sexp " + JSON.stringify(sexp))
    }

    return new IClause({ agent, verb, indirect, direct })
  } else if (head === 'what') {
    const statement = expectStatement(sexp[1])
    return interpretSexp(statement).setQuestion('What')
  } else {
    throw new Error("Unknown sexp head " + head)
  }
}

module.exports = { interpretSexp }
