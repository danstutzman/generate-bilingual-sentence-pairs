// @flow

type Per = 1 | 2 | 3
type Num = 1 | 2

type EnPreferredPronoun = "I/he" | "I/she" | "I/it" | "we/they"

class EnObject {
  name: Array<string>
  preferredPronoun: EnPreferredPronoun

  constructor(name:Array<string>, preferredPronoun:EnPreferredPronoun) {
    this.name             = name
    this.preferredPronoun = preferredPronoun
  }
}

class EnPronouns {
  me:   EnObject|void
  you:  EnObject|void
  he:   EnObject|void
  she:  EnObject|void
  it:   EnObject|void
  we:   EnObject|void
  they: EnObject|void

  constructor(args:{| me?:EnObject, you?:EnObject, we?:EnObject |}) {
    this.me  = args.me
    this.you = args.you
    this.we  = args.we
  }
  ifMatch<T>(object:EnObject, me:T, you:T, he:T, she:T, it:T, we:T, they:T,
      otherwise:T): T {
    if (object === this.me)        { return me }
    else if (object === this.you)  { return you }
    else if (object === this.he)   { return he }
    else if (object === this.she)  { return she }
    else if (object === this.it)   { return it }
    else if (object === this.we)   { return we }
    else if (object === this.they) { return they }
    else { this.update(object); return otherwise }
  }
  update(newObject:EnObject) {
    switch (newObject.preferredPronoun) {
      case "I/he":    this.he   = newObject; break
      case "I/she":   this.she  = newObject; break
      case "I/it":    this.it   = newObject; break
      case "we/they": this.they = newObject; break
      default: throw new Error("Can't update pronouns with " +
        JSON.stringify(newObject))
    }
  }
}

class EnVerbPhrase {
  agent:        EnObject
  verbSingular: string
  verbPlural:   string
  indirectObj:  EnObject | null
  directObj:    EnObject

  constructor(agent:EnObject, verbSingular:string, verbPlural:string,
      indirectObj:EnObject|null, directObj:EnObject) {
    this.agent        = agent
    this.verbSingular = verbSingular
    this.verbPlural   = verbPlural
    this.indirectObj  = indirectObj
    this.directObj    = directObj
  }
  toWords(pronouns:EnPronouns): Array<string> {
    const [agent, agentPer, agentNum]: [Array<string>, Per, Num] = pronouns.ifMatch(
      this.agent, [['I'], 1, 1], [['you'], 2, 2], [['he'], 3, 1], [['she'], 3, 1],
      [['it'], 3, 1], [['we'], 1, 2], [['they'], 3, 2],
      [this.agent.name, 3, this.agent.preferredPronoun === 'we/they' ? 2 : 1],
      true)

    const indirectObj: Array<string> = (this.indirectObj === null) ? [] :
      (this.indirectObj === this.agent) ?
        pronouns.ifMatch(this.indirectObj, ['myself'], ['yourself'], ['himself'],
          ['herself'], ['itself'], ['ourselves'], ['themselves'],
          this.indirectObj.name, true) :
        pronouns.ifMatch(this.indirectObj, ['me'], ['you'], ['him'],
          ['her'], ['it'], ['us'], ['them'], this.indirectObj.name, true)

    const directObj: Array<string> = (this.directObj === this.agent) ?
      pronouns.ifMatch(this.directObj, ['myself'], ['yourself'], ['himself'],
        ['herself'], ['itself'], ['ourselves'], ['themselves'],
        this.directObj.name, true) :
      pronouns.ifMatch(this.directObj, ['me'], ['you'], ['him'],
        ['her'], ['it'], ['us'], ['them'], this.directObj.name, true)

    return agent
      .concat((agentNum === 2 || agentPer === 1) ? this.verbPlural : this.verbSingular)
      .concat(indirectObj)
      .concat(directObj)
  }
}

module.exports = { EnObject, EnPronouns, EnVerbPhrase }
