// @flow
import type { Sexp } from '../types'
import type { NounPhrase } from './noun_phrases'

const { expectString } = require('../types')
const { UniIClause } = require('./uni_iclause')
const { NounClause } = require('./noun_phrases')

const ICLAUSE_VERBS = {
  'ask':true,
  'tell':true,
  'command':true,
  'want':true,
  'need':true,
  'have':true,
  'give':true,
}

function interpretIClause(sexp:Sexp): UniIClause {
  const head = expectString(sexp[0])
  if (ICLAUSE_VERBS[head]) {
    const verb = head
    const agent = interpretNP(sexp[1])
    let indirect:NounPhrase|void
    let direct:NounPhrase
    if (sexp.length === 3) {
      direct = interpretNP(sexp[2])
    } else if (sexp.length === 4) {
      indirect = interpretNP(sexp[2])
      direct = interpretNP(sexp[3])
    } else {
      throw new Error("Unexpected size of sexp " + JSON.stringify(sexp))
    }

    return new UniIClause({ agent, verb, indirect, direct })
  } else if (head === 'what') {
    const statement = sexp[1]
    return interpretIClause(statement).setQuestion('What')
  } else {
    throw new Error("Unknown sexp head " + head)
  }
}

function interpretNP(sexp:Sexp): NounPhrase {
  if (typeof sexp === 'string') {
    const ref = sexp.toString()
    if (ref === '') {
      throw new Error("Blank noun not allowed")
    } else if (ref !== ref.substring(0, 1).toUpperCase() + ref.substring(1)) {
      throw new Error("Expected initial caps word but got " + ref)
    }
    return ref
  } else if (Array.isArray(sexp)) {
    const head = expectString(sexp[0])
    if (head === 'that') {
      const iclause = interpretIClause(sexp[1])
      return new NounClause('that', iclause)
    } else {
      throw new Error("Unknown head " + head)
    }
  } else {
    throw new Error("Expected string or array but got " + JSON.stringify(sexp))
  }
}


module.exports = { interpretIClause }
