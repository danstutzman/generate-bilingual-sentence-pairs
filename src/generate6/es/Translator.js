// @flow
import type { Person, Tense, Number, PreferredPronouns } from './types'
import type { UniNP } from '../uni/noun_phrases'
import type { Conjugation } from './verbs'

const { UniIClause } = require('../uni/uni_iclause')
const { raise } = require('../raise')
const EsPronoun = require('./EsPronoun')
const EsPronouns = require('./EsPronouns')
const EsIClause = require('./EsIClause')
const { UniNClause } = require('../uni/noun_phrases')
const { NameNoun, EsNounClause } = require('./noun_phrases')
const { conjugate } = require('./verbs')

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
