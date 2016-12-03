// @flow
import type { Ref } from '../types'
import type { EsNP } from './noun_phrases'

export type EsSpeechActIntonation = 'question' | 'exclamation' | 'comment'

const INTONATION_TO_PUNCTUATION = {
  'question':    [['¿'], ['?']],
  'exclamation': [['¡'], ['!']],
  'comment':     [[   ], ['.']],
}

class EsSpeechAct {
  intonation: EsSpeechActIntonation
  speaker:    Ref
  speech:     EsNP

  constructor(intonation:EsSpeechActIntonation, speaker:Ref, speech:EsNP) {
    this.intonation = intonation
    this.speaker    = speaker
    this.speech     = speech
  }

  words(): Array<string> {
    return [this.speaker + ':']
      .concat(INTONATION_TO_PUNCTUATION[this.intonation][0])
      .concat(this.speech.words())
      .concat(INTONATION_TO_PUNCTUATION[this.intonation][1])
  }
}

module.exports = EsSpeechAct
