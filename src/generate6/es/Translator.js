// @flow
import type { Tense, PreferredPronouns } from './types'
import type { NounPhrase } from '../uni/noun_phrases'

const { IClause } = require('../uni/iclause')
const { raise } = require('../raise')
const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const unique_conjugation_table = require('./unique_conjugation_table')
const EsPronoun = require('./EsPronoun')
const EsPronouns = require('./EsPronouns')
const EsIClause = require('./EsIClause')
const { NounClause } = require('../uni/noun_phrases')
const { NameNoun, EsNounClause } = require('./noun_phrases')

class Translator {
  tense:                  Tense
  pronouns:               EsPronouns
  refToPreferredPronouns: {[ref:string]:PreferredPronouns}

  constructor(tense:Tense, pronouns:EsPronouns,
      refToPreferredPronouns:{[ref:string]:PreferredPronouns}) {
    this.tense                  = tense
    this.pronouns               = pronouns
    this.refToPreferredPronouns = refToPreferredPronouns
  }
  translateIClause(iclause:IClause) {
    const infinitive = {
      'want': 'querer',
      'need': 'necesitar',
      'have': 'tener',
      'give': 'dar',
      'tell': 'decir',
    }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

    let person
    let number
    let isAgentSpecific
    if (typeof iclause.agent === 'string') {
      [person, number, isAgentSpecific] = this.pronouns.lookupAgent(iclause.agent,
        this.refToPreferredPronouns)
    } else {
      [person, number, isAgentSpecific] = [3, 1, false]
    }

    let conjugation
    const uniqueConjugations = unique_conjugation_table.find01(
      infinitive, this.tense, person, number)
    if (uniqueConjugations.length === 1) {
      conjugation = uniqueConjugations[0]
    } else {
      const regularPatterns = regular_conjugation_pattern_table.find01(
        infinitive, this.tense, person, number)
      if (regularPatterns.length === 1) {
        conjugation = new RegularConjugation({ infinitive, pattern:regularPatterns[0] })
      } else {
        throw new Error(`Can't find UniqueConjugation or RegularConjugation for
          ${infinitive}.${this.tense}.${person}.${number}`)
      }
    }

    let indirectPronoun
    let isIndirectPronounSpecific = false
    if (typeof iclause.indirect === 'string') {
      [indirectPronoun, isIndirectPronounSpecific] =
        this.pronouns.lookupIndirectObj(iclause.indirect,
          typeof iclause.agent === 'string' ? iclause.agent : undefined,
          this.refToPreferredPronouns)
    }

    let [directPronoun, isDirectPronounSpecific] = [undefined, false]
    if (iclause.question !== iclause.direct &&
        typeof iclause.direct === 'string') {
      [directPronoun, isDirectPronounSpecific] =
        this.pronouns.lookupDirectObj(iclause.direct,
          typeof iclause.agent === 'string' ? iclause.agent : undefined,
          this.refToPreferredPronouns)
    }

    const question = (iclause.question === undefined) ? undefined :
      (iclause.question === 'What') ? new EsPronoun('qué') :
      raise("Unknown question type " + iclause.question)

    return new EsIClause({
      agent:       this.translateNounPhrase(iclause.agent).setOmit(isAgentSpecific),
      indirect:    iclause.indirect === undefined ? undefined :
                     this.translateNounPhrase(iclause.indirect)
                       .setOmit(isIndirectPronounSpecific),
      direct:      this.translateNounPhrase(iclause.direct).setOmit(
                     isDirectPronounSpecific || iclause.question === iclause.direct),
      conjugation, question, indirectPronoun, directPronoun,
    })
  }
  translateNounPhrase(np:NounPhrase) {
    if (typeof np == 'string') {
      return new NameNoun(np)
    } else if (np instanceof NounClause) {
      return new EsNounClause(this.translateIClause(np.iclause))
    } else {
      throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
    }
  }
}

module.exports = Translator
