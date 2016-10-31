// @flow

type per = 1 | 2 | 3
type num = 1 | 2
class proper_noun {
  per: per
  num: num
  name: string

  constructor(per:per, num:num, name:string) {
    this.per  = per
    this.num  = num
    this.name = name
  }
  conjugate(accusative: bool): Array<string> {
    return [this.name]
  }
}

class pronoun {
  per: per
  num: num
  nominative: string
  accusative: string
  reflexive: string

  constructor(per:per, num:num, nominative:string, accusative:string,
      reflexive:string) {
    this.per  = per
    this.num  = num
    this.nominative = nominative
    this.accusative = accusative
    this.reflexive  = reflexive
  }
  conjugate(accusative: bool): Array<string> {
    return accusative ? [this.accusative] : [this.nominative]
  }
}

type noun = proper_noun | pronoun

class verb {
  singular: string
  plural: string

  constructor(singular:string, plural:string) {
    this.singular = singular
    this.plural   = plural
  }
  conjugate(per:per, num:num): Array<string> {
    if (num === 1) {
      if (per === 1) {
        return [this.plural]
      } else if (per === 3) {
        return [this.singular]
      } else {
        throw new Error("Can't conjugate " + this.singular + "/" + this.plural +
          " to num=" + num + ", per=" + per)
      }
    } else {
      return [this.plural]
    }
  }
}

const Where = new proper_noun(3, 1, 'where')
const Texas = new proper_noun(3, 1, 'Texas')

function concat(wordLists:Array<Array<string>>) {
  let combined = []
  for (const wordList of wordLists) {
    combined = combined.concat(wordList)
  }
  return combined
}

function interview(A:noun, B:noun): Array<string> {
  return concat([
    ask_phrase(A, B, concat([
      ['where'],
      be_from(B, Where, Where),
    ])),
    answer(B, A, be_from(B, Texas, null)),
  ])
}

function ask_phrase(A:noun, B:noun, s:Array<string>) {
  return concat([
    A.conjugate(false),
    new verb('asks', 'ask').conjugate(A.per, A.num),
    B.conjugate(true),
    s,
    ['.'],
  ])
}

function answer(A:noun, B:noun, s:Array<string>): Array<string> {
  return concat([
    A.conjugate(false),
    new verb('answers', 'answer').conjugate(A.per, A.num),
    B.conjugate(true),
    ['that'],
    s,
    ['.'],
  ])
}

function be_from(A:noun, B:noun, remove:?noun): Array<string> {
  return concat([
    A.conjugate(false),
    be(A),
    ['from'],
    (remove === B) ? [] : B.conjugate(true),
  ])
}

function be(A:noun): Array<string> {
  if (A.num === 1) {
    if (A.per === 1) {
      return ['am']
    } else if (A.per === 3) {
      return ['is']
    } else {
      throw new Error("Can't conjugate 'be' to num=1, per=" + A.per)
    }
  } else {
    return ['are']
  }
}

const CONTRACTIONS = {
  'you are': "you're",
  'I am':    "I'm",
}
function contract(words:Array<string>): Array<string> {
  let newWords: Array<string> = []
  let i = 0

  while (i < words.length - 1) {
    const key = words[i] + ' ' + words[i + 1]
    const contraction = CONTRACTIONS[key]
    if (contraction !== undefined) {
      newWords.push(contraction)
      i += 2
    } else {
      newWords.push(words[i])
      i += 1
    }
  }

  if (i === words.length - 1) {
    newWords.push(words[i])
  }

  return newWords
}

function initialCaps(word:string): string {
  return word.substring(0, 1).toUpperCase() + word.substring(1)
}

function initialCapsAndJoin(words:Array<string>): string {
  let newWords: Array<string> = []
  let isStartingSentence = true
  for (const word of words) {
    if (isStartingSentence) {
      newWords.push(initialCaps(word))
      isStartingSentence = false
    } else if (word === '.') {
      newWords[newWords.length - 1] = newWords[newWords.length - 1] + '.'
      isStartingSentence = true
    } else {
      newWords.push(word)
      isStartingSentence = false
    }
  }
  return newWords.join(' ')
}

const Maria = new proper_noun(3, 1, 'Maria')
const Me    = new pronoun(1, 1, 'I', 'me', 'myself')
const You   = new pronoun(2, 2, 'you', 'you', 'yourself')
console.log(initialCapsAndJoin(contract(interview(Maria, Me))))
console.log(initialCapsAndJoin(contract(interview(Maria, You))))
console.log(initialCapsAndJoin(contract(interview(Me, Maria))))
console.log(initialCapsAndJoin(contract(interview(You, Maria))))
console.log(initialCapsAndJoin(contract(interview(Me, You))))
console.log(initialCapsAndJoin(contract(interview(You, Me))))
