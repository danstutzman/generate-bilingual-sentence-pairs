// @flow
import type { Ref } from '../types'
import type { EsNP } from './noun_phrases'

export type EsSpeechActIntonation = 'question' | 'exclamation' | 'comment'

const INTONATION_TO_PUNCTUATION = {
  'question':    [['¿'], ['?']],
  'exclamation': [['¡'], ['!']],
  'comment':     [[   ], ['.']],
}
const INTONATION_TO_PUNCTUATION_SKILLS = {
  'question':    [[['prod-punc-invq','¿']], [['prod-punc-q','?']]],
  'exclamation': [[['prod-punc-inve','¡']], [['prod-punc-e','!']]],
  'comment':     [[                      ], [['prod-punc-p','.']]],
}

class EsSpeechAct {
  intonation: EsSpeechActIntonation
  speaker:    Ref | void
  speech:     EsNP

  constructor(intonation:EsSpeechActIntonation, speaker:Ref|void, speech:EsNP) {
    this.intonation = intonation
    this.speaker    = speaker
    this.speech     = speech
  }

  words(): Array<string> {
    return []
      .concat(this.speaker ? [`${this.speaker}:`] : [])
      .concat(INTONATION_TO_PUNCTUATION[this.intonation][0])
      .concat(this.speech.words())
      .concat(INTONATION_TO_PUNCTUATION[this.intonation][1])
  }
  skills(): Array<[string,string]> {
    return []
      .concat(this.speaker ? [['',`${this.speaker}:`]] : [])
      .concat(INTONATION_TO_PUNCTUATION_SKILLS[this.intonation][0])
      .concat(this.speech.skills())
      .concat(INTONATION_TO_PUNCTUATION_SKILLS[this.intonation][1])
  }
}

module.exports = EsSpeechAct
