// @flow

type EnPreferredPronoun = "I/he" | "I/she" | "I/it" | "we/they"
type EsPreferredPronoun = "yo/él" | "yo/ella" | "nosotros/ellos" | "nosotras/ellas"

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

class EsObject {
  name: Array<string>
  preferredPronoun: EsPreferredPronoun
  needsPersonalA: bool

  constructor(name:Array<string>, preferredPronoun:EsPreferredPronoun,
      needsPersonalA: bool) {
    this.name             = name
    this.preferredPronoun = preferredPronoun
    this.needsPersonalA   = needsPersonalA
  }
}

class EsPronouns {
  yo:    EsObject|void
  tu:    EsObject|void
  el:    EsObject|void
  ella:  EsObject|void
  _3s:   EsObject|void
  _3p:   EsObject|void

  constructor(args:{|
    yo    ?:EsObject,
    tu    ?:EsObject,
    el    ?:EsObject,
    ella  ?:EsObject,
    tu    ?:EsObject,
    _3s   ?:EsObject,
    _3p   ?:EsObject,
  |}) {
    this.yo   = args.yo
    this.tu   = args.tu
    this.el   = args.el
    this.ella = args.ella
    this._3s  = args._3s
    this._3p  = args._3p
  }
  ifMatch<T>(object:EsObject, yo:T, tu:T, el:T, ella:T, _3s:T, _3p:T,
      otherwise:T, shouldUpdateOtherwise:bool): T {
    if (object === this.yo)        { return yo }
    else if (object === this.tu)   { return tu }
    else if (object === this.el)   { return el }
    else if (object === this.ella) { return ella }
    else if (object === this._3s)  { return _3s }
    else if (object === this._3p)  { return _3p }
    else {
      if (shouldUpdateOtherwise) {
        this.update(object)
      }
      return otherwise
    }
  }
  update(newObject:EsObject) {
    switch (newObject.preferredPronoun) {
      case "yo/él":   this._3s = this.el = newObject; break
      case "yo/ella": this._3s = this.ella = newObject; break
      case "nosotros/ellos": break
      case "nosotras/ellas": break
      default: throw new Error("Can't update pronouns with " +
        JSON.stringify(newObject))
    }
  }
}

class UniSbGiveSbSth {
  agent:    string
  receiver: string
  object:   string

  constructor(agent:string, receiver:string, object:string) {
    this.agent    = agent
    this.receiver = receiver
    this.object   = object
  }
  toEn(enObjectByName: {[name:string]: EnObject}): EnVerbPhrase {
    return new EnVerbPhrase(
      enObjectByName[this.agent],
      'gives', 'give',
      enObjectByName[this.receiver],
      enObjectByName[this.object])
  }
  toEs(esObjectByName: {[name: string]: EsObject}): EsVerbPhrase {
    return new EsVerbPhrase(
      esObjectByName[this.agent],
      'doy', 'das', 'da', 'damos', 'dan',
      esObjectByName[this.receiver],
      esObjectByName[this.object])
  }
}

class EnVerbPhrase {
  agent:        EnObject
  verbSingular: string
  verbPlural:   string
  indirectObj:  EnObject
  directObj:    EnObject

  constructor(agent:EnObject, verbSingular:string, verbPlural:string,
      indirectObj:EnObject, directObj:EnObject) {
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

    const indirectObj: Array<string> = (this.indirectObj === this.agent) ?
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

class EsVerbPhrase {
  agent: EsObject
  verb11: string
  verb21: string
  verb31: string
  verb12: string
  verb32: string
  indirectObj: EsObject
  directObj:   EsObject

  constructor(agent: EsObject, verb11: string, verb21: string, verb31: string,
      verb12: string, verb32: string, indirectObj: EsObject, directObj: EsObject) {
    this.agent = agent
    this.verb11 = verb11
    this.verb21 = verb21
    this.verb31 = verb31
    this.verb12 = verb12
    this.verb32 = verb32
    this.indirectObj = indirectObj
    this.directObj = directObj
  }
  toWords(pronouns:EsPronouns): Array<string> {
    const [agent, agentPer, agentNum]: [Array<string>, Per, Num] = pronouns.ifMatch(
      this.agent, [[], 1, 1], [[], 2, 1], [['él'], 3, 1], [['ella'], 3, 1],
      [[], 3, 1], [[], 3, 2],
      [this.agent.name, 3, this.agent.preferredPronoun.startsWith('n') ? 2 : 1],
      true)

    let indirectObjPronoun = pronouns.ifMatch(this.indirectObj,
      ['me'], ['te'], [], [], ['le'], ['les'], [], false)

// TODO: add nos and los

    const directObjPronoun = pronouns.ifMatch(this.directObj,
      ['me'], ['te'], ['lo'], ['la'], [], ['los'], [], false)

    if (['le', 'les'].indexOf(indirectObjPronoun) >= 0 &&
        ['lo', 'la', 'los', 'las'].indexOf(directObjPronoun) >= 0) {
      indirectObjPronoun = 'se'
    }

    const verb = (agentPer === 1 && agentNum === 1) ? this.verb11 :
                 (agentPer === 2 && agentNum === 1) ? this.verb21 :
                 (agentPer === 3 && agentNum === 1) ? this.verb31 :
                 (agentPer === 1 && agentNum === 2) ? this.verb12 :
                 (agentPer === 3 && agentNum === 2) ? this.verb32 :
                 'dar'

    const indirectObj = pronouns.ifMatch(this.indirectObj,
      ['a', 'mí'], ['a', 'ti'], ['a', 'él'], ['a', 'ella'], [], [],
      ['a'].concat(this.indirectObj.name), true)

    const directObj = pronouns.ifMatch(this.directObj,
      ['a', 'mí'], ['a', 'ti'], ['a', 'él'], ['a', 'ella'], [], [],
      (this.directObj.needsPersonalA ? ['a'] : []).concat(this.directObj.name),
      true)

    return agent
      .concat(indirectObjPronoun)
      .concat(directObjPronoun)
      .concat([verb])
      .concat(indirectObj)
      .concat(directObj)
  }
}

type Per = 1 | 2 | 3
type Num = 1 | 2

module.exports = { EnObject, EnPronouns, EsObject, EsPronouns, UniSbGiveSbSth }
