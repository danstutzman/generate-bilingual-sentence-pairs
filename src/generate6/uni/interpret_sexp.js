// @flow
import type { Ref, Sexp } from '../types'
import type { UniNP } from './noun_phrases'

const { expectString } = require('../types')
const { UniIClause } = require('./uni_iclause')
const { UniNClause, VALID_UNI_NCLAUSE_HEADS } = require('./noun_phrases')
const { initialCaps } = require('../join')
const { UniSpeechAct, UNI_SPEECH_ACT_VERBS } = require('./uni_speech_act')

function interpretSpeechAct(sexp:Sexp): UniSpeechAct {
  const head = expectString(sexp[0])
  if (UNI_SPEECH_ACT_VERBS[head]) {
    const speaker:Ref = expectString(sexp[1])
    const audience:Ref = expectString(sexp[2])

    const speechSexp:Sexp = sexp[3]
    let speech: UniNP | UniIClause
    if (typeof speechSexp === 'string') {
      speech = interpretNP(speechSexp, true)
    } else if (Array.isArray(speechSexp)) {
      const speechSexpHead:string = speechSexp[0].toString()
      if (VALID_UNI_NCLAUSE_HEADS[speechSexpHead]) {
        speech = interpretNP(speechSexp, true)
      } else {
        throw new Error(`Unexpected [3][0] of speech act: ${JSON.stringify(speechSexp)}`)
      }
    } else {
      throw new Error(`Unexpected [3] of speech act: ${JSON.stringify(speechSexp)}`)
    }

    return new UniSpeechAct(head, speaker, audience, speech)
  } else {
    throw new Error(`Unknown UniSpeechAct head '${head}'`)
  }
}

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
    const agent = interpretNP(sexp[1], false)
    let indirect:UniNP|void
    let direct:UniNP
    if (sexp.length === 3) {
      direct = interpretNP(sexp[2], false)
    } else if (sexp.length === 4) {
      indirect = interpretNP(sexp[2], false)
      direct = interpretNP(sexp[3], false)
    } else {
      throw new Error("Unexpected size of sexp " + JSON.stringify(sexp))
    }

    return new UniIClause({ agent, verb, indirect, direct })
  } else if (head === 'not') {
    const statement = sexp[1]
    return interpretIClause(statement).setNegative(true)
  } else {
    throw new Error(`Unknown iclause head '${head}'`)
  }
}

function interpretNP(sexp:Sexp, isTop:bool): UniNP {
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
    const iclause = interpretIClause(sexp[1]).setRemove(initialCaps(head))
    return new UniNClause(head, iclause, isTop)
  } else {
    throw new Error("Expected string or array but got " + JSON.stringify(sexp))
  }
}

module.exports = { interpretIClause, interpretSpeechAct, interpretNP }
