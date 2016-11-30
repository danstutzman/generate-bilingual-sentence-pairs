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
    const [per, num, isAgentSpecific] = pronouns.lookup(agent)
    const tense = features.past ? 'pret' : 'pres'
    const verb: string = {
      ask11pres:'pregunto', ask31pres:'pregunta',
      ask12pres:'preguntamos', ask32pres:'preguntan',
      ask11pret:'pregunté', ask31pret:'preguntó',
      ask12pret:'preguntamos', ask32pret:'preguntaron',
      tell11pres:'digo', tell31pres:'dice',
      tell12pres:'decimos', tell32pres:'dicen',
      tell11pret:'dije', tell31pret:'dijo',
      tell12pret:'dijimos', tell32pret:'dijeron',
      command11pres:'mando', command31pres:'manda',
      command12pres:'mandamos', command32pres:'mandan',
      command11pret:'mandé', command31pret:'mandó',
      command12pret:'mandamos', command32pret:'mandaron',
      want11pres:'quiero', want31pres:'quiere',
      want12pres:'quieremos', want32pres:'quieren',
      want11pret:'quise', want31pret:'quiso',
      want12pret:'quisimos', want32pret:'quiseron',
      need11pres:'necesito', need31pres:'necesita',
      need12pres:'necesitamos', need32pres:'necesitan',
      need11pret:'necesité', need31pret:'necesitó',
      need12pret:'necesitamos', need32pret:'necesitaron',
      have11pres:'tengo', have31pres: 'tiene',
      have12pres:'tenemos', have32pres: 'tienen',
      have11pret:'tuve', have31pret: 'tuvo',
      have12pret:'tuvimos', have32pret: 'tuvieron',
      give11pres:'doy', give31pres:'da',
      give12pres:'damos', give32pres:'dan',
      give11pret:'di', give31pret:'dio',
      give12pret:'dimos', give32pret:'dieron',
    }[head + per + num + tense] || (
      "Can't find conjugation '" + head + per + num + tense + "'")

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
