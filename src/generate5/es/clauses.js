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
  if (head === 'ask' || head === 'tell' || head === 'command') {
    const speaker  = expectString(parsed[1])
    const audience = expectString(parsed[2])
    const statement = expectStatement(parsed[3])
    let verb: string
    if (features.past) {
      verb = {ask:'preguntó', tell:'dijo', command:'mandó'}[head]
    } else {
      verb = {ask:'pregunta', tell:'dice', command:'manda'}[head]
    }
    return [speaker, verb, 'a', audience].concat(
      translateRelativeClause(statement, features))
  } else if (head === 'want' || head === 'need' || head == 'have') {
    const wanter = expectString(parsed[1])
    const wanted = expectString(parsed[2])
    let verb: Array<string>
    if (features.past) {
      verb = [ {want:'quiso', need:'necesitó', have:'tuvo'}[head] ]
    } else {
      verb = [ {want:'quiere', need:'necesita', have:'tiene'}[head] ]
    }
    return [wanter]
      .concat(features.negative ? ['no'] : [])
      .concat(verb)
      .concat(features.remove === wanted ? [] : [wanted])
  } else if (head === 'give') {
    const giver  = expectString(parsed[1])
    const givee  = expectString(parsed[2])
    const object = expectString(parsed[3])
    let verb
    if (features.past) {
      verb = {give:'dio'}[head]
    } else {
      verb = {give:'da'}[head]
    }
    return [giver, verb, object, 'a', givee]
  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, features)
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

module.exports = { translateIndependentClause }
