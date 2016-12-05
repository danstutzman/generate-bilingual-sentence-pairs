// @flow

class EsPronoun {
  word: string

  constructor(word:string) {
    if (word === undefined) {
      throw new Error("Pronoun constructor expected string not undefined")
    }
    this.word = word
  }
  words(): Array<string> {
    return [this.word]
  }
  skills(): Array<[string,string]> {
    return [['prod-pro-' + this.word, this.word]]
  }
}

module.exports = EsPronoun
