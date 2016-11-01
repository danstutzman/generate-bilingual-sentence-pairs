// @flow

type Sex = "male" | "female" | "neuter"

class UniObject {
  sex: Sex
  name: string

  constructor(sex:Sex, name:string) {
    this.sex  = sex
    this.name = name
  }
}

class Pronouns {
  me:  UniObject|void
  you: UniObject|void
  he:  UniObject|void
  she: UniObject|void
  it:  UniObject|void

  constructor(args:{ me?:UniObject, you?:UniObject }) {
    this.me  = args.me
    this.you = args.you
  }
  ifMatch<T>(object:UniObject, me:T, you:T, he:T, she:T, it:T, otherwise:T): T {
    if (object === this.me)       { return me }
    else if (object === this.you) { return you }
    else if (object === this.he)  { return he }
    else if (object === this.she) { return she }
    else if (object === this.it)  { return it }
    else { this.update(object); return otherwise }
  }
  update(newObject:UniObject) {
    if (newObject.sex === "male") { pronouns.he = newObject }
    else if (newObject.sex === "female") { pronouns.she = newObject }
    else if (newObject.sex === "neuter") { pronouns.it = newObject }
    else { throw new Error("Can't update pronouns with " + JSON.stringify(newObject)) }
  }
}

class UniSbGiveSbSth {
  agent:    UniObject
  receiver: UniObject
  object:   UniObject

  constructor(agent:UniObject, receiver:UniObject, object:UniObject) {
    this.agent    = agent
    this.receiver = receiver
    this.object   = object
  }
  toEn(): EnVerbPhrase {
    return new EnVerbPhrase(this.agent, 'gives', 'give', this.receiver, this.object)
  }
}

class EnVerbPhrase {
  agent:        UniObject
  verbSingular: string
  verbPlural:   string
  indirectObj:  UniObject
  directObj:    UniObject

  constructor(agent:UniObject, verbSingular:string, verbPlural:string,
      indirectObj:UniObject, directObj:UniObject) {
    this.agent        = agent
    this.verbSingular = verbSingular
    this.verbPlural   = verbPlural
    this.indirectObj  = indirectObj
    this.directObj    = directObj
  }
  toWords(pronouns:Pronouns): Array<string> {
    const [agent, agentPer, agentNum]: [string, Per, Num] = pronouns.ifMatch(
      this.agent,
      ['I', 1, 1], ['you', 2, 2], ['he', 3, 1], ['she', 3, 1], ['it', 3, 1],
      [this.agent.name, 3, 1])

    const indirectObj: string = (this.indirectObj === this.agent) ?
      pronouns.ifMatch(this.indirectObj,
        'myself', 'yourself', 'himself', 'herself', 'itself', this.indirectObj.name) :
      pronouns.ifMatch(this.indirectObj,
        'me', 'you', 'him', 'her', 'it', this.indirectObj.name)

    const directObj: string = (this.directObj === this.agent) ?
      pronouns.ifMatch(this.indirectObj,
        'myself', 'yourself', 'himself', 'herself', 'itself', this.directObj.name) :
      pronouns.ifMatch(this.directObj,
        'me', 'you', 'him', 'her', 'it', this.directObj.name)

    return [agent]
      .concat((agentNum === 2 || agentPer === 1) ? this.verbPlural : this.verbSingular)
      .concat([indirectObj, directObj])
  }
}

type Per = 1 | 2 | 3
type Num = 1 | 2

const maria  = new UniObject('female', 'Maria')
const dan    = new UniObject('male', 'Dan')
const robot  = new UniObject('neuter', 'the robot')
const story = new UniSbGiveSbSth(dan, maria, robot)
const pronouns = new Pronouns({ me: dan })
console.log(story.toEn().toWords(pronouns))
//console.log(pronouns)
