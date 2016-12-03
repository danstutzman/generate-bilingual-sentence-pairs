// @flow
import type { Person, Tense, Number, PreferredPronouns } from './types'
import type { UniNP } from '../uni/noun_phrases'
import type { EnNP } from './noun_phrases'

const EnPronoun = require('./EnPronoun')
const { raise } = require('../raise')
const { UniNClause } = require('../uni/noun_phrases')
const { NameNoun, EnNClause } = require('./noun_phrases')
const EnIClause = require('./EnIClause')
const { UniIClause } = require('../uni/uni_iclause')
const EnPronouns = require('./EnPronouns')
const { conjugate, EnVerb } = require('./verbs')
const EnSpeechAct = require('./EnSpeechAct')
const { UniSpeechAct } = require('../uni/uni_speech_act')

class Translator {
  tense:                  Tense
  pronouns:               EnPronouns
  refToPreferredPronouns: {[ref:string]:PreferredPronouns}

  constructor(tense:Tense, pronouns:EnPronouns,
      refToPreferredPronouns:{[ref:string]:PreferredPronouns}) {
    this.tense                  = tense
    this.pronouns               = pronouns
    this.refToPreferredPronouns = refToPreferredPronouns
  }

  translateSpeechAct(speechAct:UniSpeechAct): EnSpeechAct {
    if (speechAct.speech instanceof UniNClause) {
      const np = speechAct.speech
      const intonation = (speechAct.verb === 'ask') ? 'question' :
                         (speechAct.verb === 'command') ? 'exclamation' :
                         'comment'
      const headWords = (np.type === 'that') ? [] : [np.type]
      // e.g. "Who are you" instead of "Who you are"
      return new EnSpeechAct(intonation, speechAct.speaker, new EnNClause(headWords,
        this.translateIClause(np.iclause, np.type !== 'that')))
    } else {
      throw new Error(
        `Don't know how to translate speech '${JSON.stringify(speechAct.speech)}'`)
    }
  }

  translateIClause(iclause:UniIClause, isVerbFirst:bool): EnIClause {
    let person = 3
    let number = 1
    let agent
    if (typeof iclause.agent === 'string') {
      [person, number, agent] = this.pronouns.lookup(iclause.agent, undefined, true,
        this.refToPreferredPronouns)
    }
    if (agent === undefined) {
      [person, number, agent] = [3, 1, this.translateNounPhrase(iclause.agent)]
    }

    const helpingVerb = isVerbFirst || iclause.negative ?
      conjugate('do', this.tense, person, number, iclause.negative) : undefined
    const mainVerb = isVerbFirst || iclause.negative ?
      new EnVerb([iclause.verb]) :
      conjugate(iclause.verb, this.tense, person, number, false)

    let indirect: EnNP | void
    if (iclause.indirect !== undefined) {
      if (typeof iclause.indirect === 'string') {
        indirect = this.pronouns.lookup(iclause.indirect,
          typeof iclause.agent === 'string' ? iclause.agent : undefined, false,
          this.refToPreferredPronouns)[2]
        if (indirect === undefined &&
            /* flowtype workaround */ iclause.indirect !== undefined) {
          indirect = this.translateNounPhrase(iclause.indirect)
        }
      }
    }

    let direct
    if (iclause.remove !== iclause.direct) {
      if (typeof iclause.direct === 'string') {
        direct = this.pronouns.lookup(iclause.direct,
          typeof iclause.agent === 'string' ? iclause.agent : undefined, false,
          this.refToPreferredPronouns)[2]
      }
      if (direct === undefined) {
        direct = this.translateNounPhrase(iclause.direct)
      }
    }

    return new EnIClause({ agent, helpingVerb, mainVerb, direct, indirect, isVerbFirst })
  }

  translateNounPhrase(np:UniNP): EnNClause {
    if (typeof np == 'string') {
      return new NameNoun(np)
    } else if (np instanceof UniNClause) {
      return new EnNClause([np.type], this.translateIClause(np.iclause, false))
    } else {
      throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
    }
  }

  translateAny(clause:Object|void) {
    if (clause instanceof UniIClause) {
      return this.translateIClause(clause, false)
    } else if (clause instanceof UniNClause) {
      const np:UniNClause = clause
      const headWords = (clause.type === 'that') ? [] : [np.type]
      // e.g. "Who are you" instead of "Who you are"
      return new EnNClause(headWords,
        this.translateIClause(np.iclause, np.type !== 'that'))
    } else {
      throw new Error(`Can't translateAny #{JSON.stringify(clause)}`)
    }
  }
}

module.exports = Translator
