// @flow
import type { Person, Tense, Number, PreferredPronouns } from './types'
import type { UniNP } from '../uni/noun_phrases'
import type { EsNP } from '../es/noun_phrases'
import type { Conjugation } from './verbs'

const { UniIClause } = require('../uni/uni_iclause')
const { UniSpeechAct } = require('../uni/uni_speech_act')
const { raise } = require('../raise')
const EsPronoun = require('./EsPronoun')
const EsPronouns = require('./EsPronouns')
const EsIClause = require('./EsIClause')
const EsSpeechAct = require('./EsSpeechAct')
const { UniNClause } = require('../uni/noun_phrases')
const { NameNoun, EsNClause } = require('./noun_phrases')
const { conjugate } = require('./verbs')

const UNI_NCLAUSE_TYPE_TO_HEAD_WORDS_IF_NOT_TOP = {
  'that': ['que'],
  'what': ['lo', 'que'],
  'why':  ['por', 'qué'],
  'where':['donde'],
}
const UNI_NCLAUSE_TYPE_TO_HEAD_WORDS_IF_TOP = {
  'that': [],
  'what': ['qué'],
  'why':  ['por', 'qué'],
  'where':['dónde'],
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

  translateSpeechAct(speechAct:UniSpeechAct): EsSpeechAct {
    if (speechAct.speech instanceof UniNClause) {
      const np = speechAct.speech
      const intonation = (speechAct.verb === 'ask') ? 'question' :
                         (speechAct.verb === 'command') ? 'exclamation' :
                         'comment'
      const headWords = UNI_NCLAUSE_TYPE_TO_HEAD_WORDS_IF_TOP[np.type] ||
        raise(`Unknown UniNClause type '${np.type}'`)
      // e.g. "Who are you" instead of "Who you are"
      return new EsSpeechAct(intonation, speechAct.speaker, new EsNClause(headWords,
        this.translateIClause(np.iclause).setVerbFirst(np.type !== 'that')))
    } else {
      throw new Error(
        `Don't know how to translate speech '${JSON.stringify(speechAct.speech)}'`)
    }
  }

  translateIClause(iclause:UniIClause): EsIClause {
    const infinitive = {
      'want': 'querer',
      'need': 'necesitar',
      'have': 'tener',
      'give': 'dar',
      'tell': 'decir',
      'ask': 'preguntar',
      'command': 'ordenar',
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
    if (iclause.remove !== iclause.direct &&
        typeof iclause.direct === 'string') {
      [directPronoun, isDirectPronounSpecific] =
        this.pronouns.lookupDirectObj(iclause.direct,
          typeof iclause.agent === 'string' ? iclause.agent : undefined,
          this.refToPreferredPronouns)
    }

    return new EsIClause({
      agent:       this.translateNounPhrase(iclause.agent).setOmit(isAgentSpecific),
      indirect:    iclause.indirect === undefined ? undefined :
                     this.translateNounPhrase(iclause.indirect)
                       .setOmit(isIndirectPronounSpecific),
      direct:      this.translateNounPhrase(iclause.direct).setOmit(
                     isDirectPronounSpecific || iclause.remove === iclause.direct),
      negative:    iclause.negative,
      conjugation, indirectPronoun, directPronoun,
    })
  }

  translateNounPhrase(np:UniNP): EsNP {
    if (typeof np == 'string') {
      return new NameNoun(np)
    } else if (np instanceof UniNClause) {
      const headWords = UNI_NCLAUSE_TYPE_TO_HEAD_WORDS_IF_NOT_TOP[np.type] ||
        raise(`Unknown UniNClause type '${np.type}'`)
      return new EsNClause(headWords, this.translateIClause(np.iclause))
    } else {
      throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
    }
  }

  translateAny(clause:Object|void) {
    if (clause instanceof UniIClause) {
      return this.translateIClause(clause)
    } else if (clause instanceof UniNClause) {
      const np:UniNClause = clause
      const headWords = UNI_NCLAUSE_TYPE_TO_HEAD_WORDS_IF_TOP[np.type] ||
        raise(`Unknown UniNClause type '${np.type}'`)
      // e.g. "Who are you" instead of "Who you are"
      return new EsNClause(headWords,
        this.translateIClause(np.iclause).setVerbFirst(np.type !== 'that'))
    } else {
      throw new Error(`Can't translateAny #{JSON.stringify(clause)}`)
    }
  }
}

module.exports = Translator
