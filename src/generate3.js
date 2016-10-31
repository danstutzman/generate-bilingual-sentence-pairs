// @flow

type Per = 1 | 2 | 3
type Num = 1 | 2
type Gen = 'M' | 'F' | 'N'

class NounPhrase {
  per: Per
  num: Num

  constructor(per:Per, num:Num) {
    this.per = per
    this.num = num
  }
  out(accusative:bool, possessive:bool): Array<string> {
    throw new Error("Need overridden by child")
  }
}

class Noun extends NounPhrase {
  gen: Gen
  name: string

  constructor(num:Num, gen:Gen, name:string) {
    super(3, num)
    this.gen = gen
    this.name = name
  }
  out(accusative:bool, possessive:bool): Array<string> {
    return [this.name]
      .concat(possessive ? ["'s"] : [])
  }
}

class Pronoun extends NounPhrase {
  nominative: string
  accusative: string
  possessive: string

  constructor(per:Per, num:Num, nominative:string, accusative:string,
      possessive:string) {
    super(per, num)
    this.nominative = nominative
    this.accusative = accusative
    this.possessive = possessive
  }
  out(accusative:bool, possessive:bool): Array<string> {
    if (possessive) { return [this.possessive] }
    return accusative ? [this.accusative] : [this.nominative]
  }
}

class Verb {
  singular: string
  plural: string

  constructor(singular:string, plural:string) {
    this.singular = singular
    this.plural = plural
  }
  out(per:Per, num:Num): Array<string> {
    return (num === 2 || per === 1) ? [this.plural] : [this.singular]
  }
}

class DirectObjectVerbPhrase {
  agent:  NounPhrase
  verb:   Verb
  object: NounPhrase

  constructor(agent:NounPhrase, verb:Verb, object:NounPhrase) {
    this.agent  = agent
    this.verb   = verb
    this.object = object
  }
  out(): Array<string> {
    return this.agent.out(false, false)
      .concat(this.verb.out(this.agent.per, this.agent.num))
      .concat(this.object.out(true, false))
  }
}

class Owned extends NounPhrase {
  owner: NounPhrase
  object: Noun

  constructor(owner:NounPhrase, object:Noun) {
    super(3, object.num)
    this.owner  = owner
    this.object = object
  }
  out(): Array<string> {
    return this.owner.out(true, true)
      .concat(this.object.out(false, false))
  }
}

const me = new Pronoun(1, 1, 'I', 'me', 'my')
const have = new Verb('has', 'have')
const wallet = new Noun(1, 'N', 'wallet')
const maria = new Noun(1, 'F', 'Maria')
const stories = [
  new DirectObjectVerbPhrase(me,    have, new Owned(me,    wallet)),
  new DirectObjectVerbPhrase(maria, have, new Owned(maria, wallet)),
]
for (const story of stories) {
  console.log(story.out())
}
