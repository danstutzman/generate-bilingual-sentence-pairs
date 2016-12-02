// @flow

function initialCaps(word:string): string {
  return word.substring(0, 1).toUpperCase() + word.substring(1)
}

function removeEndingHyphen(word:string): string {
  return word.endsWith('-') ? word.substring(0, word.length - 1) : word
}

function join(words:Array<string>): string {
  let newWords: Array<string> = []
  let isStartingSentence: bool = true
  for (const word of words) {
    if (isStartingSentence) {
      newWords.push(initialCaps(word))
      isStartingSentence = false
    } else if (word === '.') {
      newWords[newWords.length - 1] = newWords[newWords.length - 1] + '.'
      isStartingSentence = true
    } else if (word.startsWith('-')) {
      newWords[newWords.length - 1] = removeEndingHyphen(newWords[newWords.length - 1]) +
        word.substring(1)
    } else {
      newWords.push(word)
      isStartingSentence = false
    }
  }
  return newWords.join(' ')
}

module.exports = { join }
