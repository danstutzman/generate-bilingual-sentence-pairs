// @flow
import type { Ref } from '../types'
import type { EnNP } from './noun_phrases'

export type EnSpeechActIntonation = 'question' | 'exclamation' | 'comment'

const INTONATION_TO_PUNCTUATION = {
  'question':    '?',
  'exclamation': '!',
  'comment':     '.',
}

class EnSpeechAct {
  intonation: EnSpeechActIntonation
  speaker:    Ref
  speech:     EnNP

  constructor(intonation:EnSpeechActIntonation, speaker:Ref, speech:EnNP) {
    this.intonation = intonation
    this.speaker    = speaker
    this.speech     = speech
  }

  words(): Array<string> {
    return [this.speaker + ':']
      .concat(this.speech.words())
      .concat(INTONATION_TO_PUNCTUATION[this.intonation])
  }
}

module.exports = EnSpeechAct
