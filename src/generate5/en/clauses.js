// @flow
import type { Features, Sexp } from '../types'

const types = require('../types')
const { EnPronouns } = require('./pronouns')
const { expectString, expectStatement, merge } = types

function translateRelativeClause(parsed:Sexp, pronouns:EnPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return ['that'].concat(translateIndependentClause(statement, pronouns, features))
  } else if (head === 'what') {
    const statement = expectStatement(parsed[1])
    return ['what'].concat(translateIndependentClause(statement, pronouns,
      merge(features, { remove: 'what', invert: false })))
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['why'].concat(translateIndependentClause(statement, pronouns, features))
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateIndependentClause(parsed:Sexp, pronouns:EnPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if ({ ask:true, tell:true, command:true, want:true, need:true, have:true, give:true
        }[head]) {
    const agent       = expectString(parsed[1])
    const indirectObj = expectString(parsed[2])
    const directObj   = parsed[3] // string (e.g. ask a question) or statement (ask why...)

    let auxilary: Array<string>
    if (features.negative) {
      if (features.past) {
        auxilary = ["doesn't"]
      } else {
        auxilary = ["didn't"]
      }
    } else if (features.invert) {
      if (features.past) {
        auxilary = ["did"]
      } else {
        auxilary = ["does"]
      }
    } else {
      auxilary = []
    }

    let verb: string
    if (!features.negative && !features.invert) {
      if (features.past) {
        verb = {tell:'told', have:'had', give:'gave'}[head] || (head + 'ed')
      } else {
        verb = {have:'has', give:'gives'}[head] || (head + 's')
      }
    } else {
      verb = head
    }

    return (features.invert ? [] : [agent])
      .concat(auxilary)
      .concat(features.invert ? [agent] : [])
      .concat([verb])
      .concat(indirectObj !== '' ? [indirectObj] : [])
      .concat(features.remove === directObj ? [] :
        typeof(directObj) === 'string' ? [directObj] :
          translateRelativeClause(directObj, pronouns, features))

  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, pronouns, features)
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['what']
      .concat(translateIndependentClause(statement, pronouns,
        merge(features, { remove: 'what', invert: true })))
      .concat(['?'])
  } else if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return translateIndependentClause(statement, pronouns, features)
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['why']
      .concat(translateIndependentClause(statement, pronouns,
        merge(features, { remove: 'why', invert: true })))
      .concat(['?'])
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateSpeechActShort(parsed:Sexp, pronouns:EnPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'ask' || head === 'tell' || head === 'command') {
    const speaker   = expectString(parsed[1])
    const audience  = expectString(parsed[2])
    const statement = expectStatement(parsed[3])
    return [speaker + ':'].concat(translateIndependentClause(statement, pronouns, features))
  } else {
    throw new Error("Unexpected speech act verb: " + head)
  }
}

function newPronouns(): EnPronouns {
  return new EnPronouns()
}

module.exports = { newPronouns, translateIndependentClause, translateSpeechActShort }
