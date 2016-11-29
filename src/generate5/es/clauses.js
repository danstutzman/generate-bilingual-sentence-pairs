// @flow
import type { Sexp, Features } from '../types'

const types = require('../types')
const { expectString, expectStatement, merge } = types

function translateRelativeClause(parsed: Sexp, features: Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'that') {
    const statement = parsed[1]
    return ['que'].concat(translateIndependentClause(statement, features))
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['lo', 'que'].concat(translateIndependentClause(statement,
      merge(features, merge(features, { remove: 'what' }))))
  } else if (head === 'why') {
    const statement = parsed[1]
    return ['por', 'qué'].concat(translateIndependentClause(statement, features))
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateIndependentClause(parsed: Sexp, features: Features): Array<string> {
  const head = expectString(parsed[0])
  if ({ ask:true, tell:true, command:true, want:true, need:true, have:true, give:true
      }[head]) {
    const agent       = expectString(parsed[1])
    const indirectObj = expectString(parsed[2])
    const directObj   = parsed[3] // could be string or statement
    let verb: string
    if (features.past) {
      verb = {ask:'preguntó', tell:'dijo', command:'mandó',
              want:'quiso', need:'necesitó', have:'tuvo', give:'dio'}[head]
    } else {
      verb = {ask:'pregunta', tell:'dice', command:'manda',
              want:'quiere', need:'necesita', have:'tiene', give:'da'}[head]
    }

    return (features.remove ? [] : [agent])
      .concat(features.negative ? ['no'] : [])
      .concat([verb])
      .concat(features.remove ? [agent] : [])
      .concat(indirectObj !== '' ? ['a', indirectObj] : [])
      .concat(features.remove === directObj ? [] :
        typeof(directObj) === 'string' ? [directObj] :
          translateRelativeClause(directObj, features))

  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, features)
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['qué']
      .concat(translateIndependentClause(statement, merge(features, {remove: 'what'})))
      .concat(['?'])
  } else if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return translateIndependentClause(statement, features)
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['por', 'qué']
      .concat(translateIndependentClause(statement, merge(features, {remove: 'why'})))
      .concat(['?'])
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateSpeechActShort(parsed: Sexp, features: Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'ask' || head === 'tell' || head === 'command') {
    const speaker   = expectString(parsed[1])
    const audience  = expectString(parsed[2])
    const statement = expectStatement(parsed[3])
    return [speaker + ':'].concat(translateIndependentClause(statement, features))
  } else {
    throw new Error("Unknown speech act verb: " + head)
  }
}

module.exports = { translateIndependentClause, translateSpeechActShort }
