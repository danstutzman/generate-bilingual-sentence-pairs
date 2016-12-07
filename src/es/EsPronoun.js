// @flow
import type { Skill } from '../types'

class EsPronoun {
  word: string

  constructor(word:string) {
    if (word === undefined) {
      throw new Error("Pronoun constructor expected string not undefined")
    }
    this.word = word
  }
  skills(): Array<[Skill,string]> {
    return [['pro-' + this.word, this.word]]
  }
}

module.exports = EsPronoun
