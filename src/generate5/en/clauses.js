// @flow
import type { Features, Sexp } from '../types'

const types = require('../types')
const { expectString, expectStatement, merge } = types

function translateRelativeClause(parsed: Sexp, features: Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return ['that'].concat(translateIndependentClause(statement, features))
  } else if (head === 'what') {
    const statement = expectStatement(parsed[1])
    return ['what'].concat(translateIndependentClause(statement,
      merge(features, { remove: 'what', invert: false })))
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['why'].concat(translateIndependentClause(statement, features))
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
      verb = {ask:'asked', tell:'told', command:'commanded'}[head]
    } else {
      verb = {ask:'asks', tell:'tells', command:'commands'}[head]
    }
    return [speaker, verb, audience].concat(
      translateRelativeClause(statement, features))
  } else if (head === 'want' || head === 'need' || head == 'have' || head === 'give') {
    const wanter = expectString(parsed[1])
    let givee: string|null = null
    if (head === 'give') {
      givee = expectString(parsed[2])
    }
    const wanted = expectString(parsed[(head == 'give') ? 3 : 2])

    let auxilary: string|null = null
    if (features.negative) {
      if (features.past) {
        auxilary = "doesn't"
      } else {
        auxilary = "didn't"
      }
    } else if (features.invert) {
      if (features.past) {
        auxilary = "did"
      } else {
        auxilary = "does"
      }
    }

    let verb = head
    if (!features.negative && !features.invert) {
      if (features.past) {
        verb = {have:'had', give:'gave'}[head] || (head + 'ed')
      } else {
        verb = {have:'has', give:'gives'}[head] || (head + 's')
      }
    }
    return (features.invert ? [] : [wanter])
      .concat(auxilary !== null ? [auxilary] : [])
      .concat(features.invert ? [wanter] : [])
      .concat([verb])
      .concat(givee !== null ? [givee] : [])
      .concat(features.remove === wanted ? [] : [wanted])
  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, features)
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['what']
      .concat(translateIndependentClause(statement,
        merge(features, { remove: 'what', invert: true })))
      .concat(['?'])
  } else if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return translateIndependentClause(statement, features)
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['why']
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
    throw new Error("Unexpected speech act verb: " + head)
  }
}

module.exports = { translateIndependentClause, translateSpeechActShort }
