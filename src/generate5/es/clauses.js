// @flow
import type { Sexp, Features } from '../types'

const types = require('../types')
const { EsPronouns } = require('./pronouns')
const { expectNoun, expectString, expectStatement, merge } = types

function translateRelativeClause(parsed:Sexp, pronouns:EsPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'that') {
    const statement = parsed[1]
    return ['que'].concat(translateIndependentClause(statement, pronouns, features))
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['lo', 'que'].concat(translateIndependentClause(statement, pronouns,
      merge(features, merge(features, { remove: 'what', invert: true }))))
  } else if (head === 'why') {
    const statement = parsed[1]
    return ['por', 'qué'].concat(translateIndependentClause(statement, pronouns, features))
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateIndependentClause(parsed:Sexp, pronouns:EsPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if ({ ask:true, tell:true, command:true, want:true, need:true, have:true, give:true
      }[head]) {
    const agent       = expectNoun(parsed[1], true)
    const indirectObj = expectNoun(parsed[2], false)
    const directObj   = parsed[3] // could be string or statement
    const [per, isAgentSpecific] = pronouns.lookup(agent)
    const tense = features.past ? 'pret' : 'pres'
    const verb: string = {
      ask1pres:'pregunto', ask3pres:'pregunta',
      ask1pret:'pregunté', ask3pret:'preguntó',
      tell1pres:'digo', tell3pres:'dice',
      tell1pret:'dijo', tell3pret:'dije',
      command1pres:'mando', command3pres:'manda',
      command1pret:'mandé', command3pret:'mandó',
      want1pres:'quiero', want3pres:'quiere',
      want1pret:'quise', want3pret:'quiso',
      need1pres:'necesito', need3pres:'necesita',
      need1pret:'necesité', need3pret:'necesitó',
      have1pres:'tengo', have3pres: 'tiene',
      have1pret:'tuvo', have3pret: 'tuve',
      give1pres:'doy', give3pres:'da',
      give1pret:'di', give3pret:'dio',
    }[head + per + tense] || ("Can't find conjugation '" + head + per + tense + "'")

    return (features.negative ? ['no'] : [])
      .concat(features.invert ? [verb] : [])
      .concat(isAgentSpecific ? [] : [agent])
      .concat(features.invert ? [] : [verb])
      .concat(indirectObj !== '' ? ['a', indirectObj] : [])
      .concat(features.remove === directObj ? [] :
        typeof(directObj) === 'string' ? [directObj] :
          translateRelativeClause(directObj, pronouns, features))

  } else if (head === 'not') {
    const statement = parsed[1]
    return translateIndependentClause(statement, pronouns, features)
  } else if (head === 'what') {
    const statement = parsed[1]
    return ['qué']
      .concat(translateIndependentClause(statement, pronouns,
        merge(features, {remove: 'what'})))
      .concat(['?'])
  } else if (head === 'that') {
    const statement = expectStatement(parsed[1])
    return translateIndependentClause(statement, pronouns, features)
  } else if (head === 'why') {
    const statement = expectStatement(parsed[1])
    return ['por', 'qué']
      .concat(translateIndependentClause(statement, pronouns,
        merge(features, {remove: 'why'})))
      .concat(['?'])
  } else {
    throw new Error("Don't know how to translate head=" + head)
  }
}

function translateSpeechActShort(parsed:Sexp, pronouns:EsPronouns,
    features:Features): Array<string> {
  const head = expectString(parsed[0])
  if (head === 'ask' || head === 'tell' || head === 'command') {
    const speaker   = expectString(parsed[1])
    const audience  = expectString(parsed[2])
    const statement = expectStatement(parsed[3])
    return [speaker + ':'].concat(translateIndependentClause(statement, pronouns,
      merge(features, {invert: true})))
  } else {
    throw new Error("Unknown speech act verb: " + head)
  }
}

module.exports = { translateIndependentClause, translateSpeechActShort }
