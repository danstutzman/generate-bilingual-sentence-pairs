// @flow
import type { Ref, Skill } from '../types'
import type { EsNP } from './noun_phrases'

export type EsSpeechActIntonation = 'question' | 'exclamation' | 'comment'

const INTONATION_TO_PUNCTUATION = {
  'question':    '?',
  'exclamation': '!',
  'comment':     '.',
}

class EsSpeechAct {
  intonation: EsSpeechActIntonation
  speaker:    Ref | void
  speech:     EsNP

  constructor(intonation:EsSpeechActIntonation, speaker:Ref|void, speech:EsNP) {
    if (INTONATION_TO_PUNCTUATION[intonation] === undefined) {
      throw new Error(`Unknown intonation '${intonation}'`)
    }
    this.intonation = intonation
    this.speaker    = speaker
    this.speech     = speech
  }

  words(): Array<string> {
    return []
//      .concat(this.speaker ? [`${this.speaker}:`] : [])
      .concat(this.speech.words())
      .concat([INTONATION_TO_PUNCTUATION[this.intonation]])
  }
  skills(): Array<[Skill,string]> {
    return []
//      .concat(this.speaker ? [['',`${this.speaker}:`]] : [])
      .concat(this.speech.skills())
      .concat([['', INTONATION_TO_PUNCTUATION[this.intonation]]])
  }
}

module.exports = EsSpeechAct
