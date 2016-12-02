// @flow
import type { Person, Tense, Number, PreferredPronouns } from './types'
import type { UniNP } from '../uni/noun_phrases'
import type { Conjugation } from './verbs'

const { UniIClause } = require('../uni/uni_iclause')
const { raise } = require('../raise')
const RegularConjugation = require('./verbs/RegularConjugation')
const regular_conjugation_pattern_table =
  require('./verbs/regular_conjugation_pattern_table')
const unique_conjugation_table = require('./verbs/unique_conjugation_table')
const stem_change_table = require('./verbs/stem_change_table')
const EsPronoun = require('./EsPronoun')
const EsPronouns = require('./EsPronouns')
const EsIClause = require('./EsIClause')
const { UniNClause } = require('../uni/noun_phrases')
const { NameNoun, EsNounClause } = require('./noun_phrases')

function conjugate(infinitive:string, tense:Tense, person:Person, number:Number):
    Conjugation {
  const uniqueConjugations = unique_conjugation_table.find01(
    infinitive, tense, person, number)
  if (uniqueConjugations.length === 1) {
    return uniqueConjugations[0]
  }

  const stemChanges = stem_change_table.find01(infinitive, tense)
  if (stemChanges.length === 1) {
    const patterns = regular_conjugation_pattern_table.find01(
      infinitive, tense, person, number, true)
    if (patterns.length === 1) {
      return new stem_change_table.StemChangeConjugation(infinitive, stemChanges[0],
        patterns[0])
    } else {
      throw new Error(`Can't find RegularConjugationPattern for stem-changing
        ${infinitive}.${tense}.${person}.${number}`)
    }
  }

  const regularPatterns = regular_conjugation_pattern_table.find01(
    infinitive, tense, person, number, false)
  if (regularPatterns.length === 1) {
    return new RegularConjugation({ infinitive, pattern:regularPatterns[0] })
  } else {
    throw new Error(`Can't find UniqueConjugation or RegularConjugation for
      ${infinitive}.${tense}.${person}.${number}`)
  }
}

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
  translateIClause(iclause:UniIClause) {
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

    const conjugation = conjugate(infinitive, this.tense, person, number)

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
  translateNounPhrase(np:UniNP) {
    if (typeof np == 'string') {
      return new NameNoun(np)
    } else if (np instanceof UniNClause) {
      return new EsNounClause(this.translateIClause(np.iclause))
    } else {
      throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
    }
  }
}

module.exports = Translator
