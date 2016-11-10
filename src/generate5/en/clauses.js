// @flow
import type { Sexp } from '../types'

function expectString(sexp: Sexp): string {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  return sexp.toString()
}

function expectStatement(sexp: Sexp): Sexp {
  if (typeof sexp === 'string') {
    throw new Error("Expected Array<string> but got " + sexp.toString())
  }
  return sexp
}

type Features = {|
  negative?: bool,
  remove?:   'what',
  past?:     bool,
|}

function merge(base: Features, additions: Features): Features {
  if (typeof base !== 'object') {
    throw new Error("Expected object for base but got " + JSON.stringify(base))
  }
  if (typeof additions !== 'object') {
    throw new Error("Expected object for additions but got " +
      JSON.stringify(additions))
  }

  let output: Features = { negative: false }
  for (const key in base) {
    if (base.hasOwnProperty(key)) {
      output[key] = base[key]
    }
  }
  for (const key in additions) {
    if (additions.hasOwnProperty(key)) {
      output[key] = additions[key]
    }
  }
  return output
}

function translateRelativeClause(parsed: Sexp, features: Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'that') {
    const statement = parsed[1]
    return ['that'].concat(translateIndependentClause(statement, features))
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['what'].concat(translateIndependentClause(statement,
      merge(features, merge(features, { remove: 'what' }))))
  } else if (head === 'why') {
    const statement = parsed[1]
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
  } else if (head === 'want' || head === 'need' || head == 'have') {
    const wanter = expectString(parsed[1])
    const wanted = expectString(parsed[2])
    let verb: Array<string>
    if (features.negative) {
      if (features.past) {
        verb = ["doesn't", head]
      } else {
        verb = ["didn't", head]
      }
    } else {
      if (features.past) {
        verb = [ {have:'had'}[head] || (head + 'ed') ]
      } else {
        verb = [ {have:'has'}[head] || (head + 's') ]
      }
    }
    return [wanter]
      .concat(verb)
      .concat(features.remove === wanted ? [] : [wanted])
  } else if (head === 'give') {
    const giver  = expectString(parsed[1])
    const givee  = expectString(parsed[2])
    const object = expectString(parsed[3])
    let verb
    if (features.past) {
      verb = {give:'gave'}[head]
    } else {
      verb = {give:'gives'}[head]
    }
    return [giver, verb, object, 'to', givee]
  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, features)
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

module.exports = { translateIndependentClause }