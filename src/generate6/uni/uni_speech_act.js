// @flow
import type { Ref } from '../types'
import type { UniNP } from './noun_phrases'

const UNI_SPEECH_ACT_VERBS = { 'ask':true, 'command':true, 'tell':true }

class UniSpeechAct {
  verb:      string
  speaker:   Ref | void
  audience:  Ref | void
  speech:    UniNP

  constructor(verb:string, speaker:Ref|void, audience:Ref|void, speech:UniNP) {
    this.verb     = verb
    this.speaker  = speaker
    this.audience = audience
    this.speech   = speech
  }
}

module.exports = { UniSpeechAct, UNI_SPEECH_ACT_VERBS }
