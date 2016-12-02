// @flow

class Pronoun {
  word: string

  constructor(word:string) {
    this.word = word
  }
  words(): Array<string> {
    return [this.word]
  }
}

module.exports = Pronoun
