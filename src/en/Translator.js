// @flow
import type { Ref } from '../types'
import type { Person, Tense, Number, EnIdentity } from './types'
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
  tense:         Tense
  pronouns:      EnPronouns
  refToIdentity: {[ref:Ref]:EnIdentity}

  constructor(tense:Tense, pronouns:EnPronouns, refToIdentity:{[ref:Ref]:EnIdentity}) {
    this.tense         = tense
    this.pronouns      = pronouns
    this.refToIdentity = refToIdentity
  }

  translateSpeechAct(speechAct:UniSpeechAct): EnSpeechAct {
    this.pronouns.me = speechAct.speaker
    this.pronouns.you = speechAct.audience

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
        this.refToIdentity)
    }
    if (agent === undefined) {
      person = person || 3
      number = number || 1
      agent = this.translateNounPhrase(iclause.agent)
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
          this.refToIdentity)[2]
        if (indirect === undefined &&
            /* flowtype workaround */ iclause.indirect !== undefined) {
          indirect = this.translateNounPhrase(iclause.indirect)
        }
      }
    }

    let direct: EnNP | void
    if (iclause.direct !== undefined && iclause.remove !== iclause.direct) {
      if (typeof iclause.direct === 'string') {
        direct = this.pronouns.lookup(iclause.direct,
          typeof iclause.agent === 'string' ? iclause.agent : undefined, false,
          this.refToIdentity)[2]
      }
      if (direct === undefined &&
          /* flowtype workaround */ iclause.direct !== undefined) {
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
}

module.exports = Translator
