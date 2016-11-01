// @flow

type Per = 1 | 2 | 3
type Num = 1 | 2

type EsPreferredPronoun = "yo/él" | "yo/ella" | "nosotros/ellos" | "nosotras/ellas"

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

class EsVerb {
  _11: string
  _21: string
  _31: string
  _12: string
  _32: string

  constructor(_11: string, _21: string, _31: string, _12: string, _32: string) {
    this._11 = _11
    this._21 = _21
    this._31 = _31
    this._12 = _12
    this._32 = _32
  }
  conjugate(per:Per, num:Num) {
    if      (per === 1 && num === 1) { return this._11 }
    else if (per === 2 && num === 1) { return this._21 }
    else if (per === 3 && num === 1) { return this._31 }
    else if (per === 1 && num === 2) { return this._12 }
    else if (per === 3 && num === 2) { return this._32 }
    else { throw new Error("Can't conjugate per=" + per + " num=" + num) }
  }
}

class EsVerbPhrase {
  agent:       EsObject
  verb:        EsVerb
  indirectObj: EsObject
  directObj:   EsObject

  constructor(agent:EsObject, verb:EsVerb, indirectObj:EsObject, directObj:EsObject) {
    this.agent       = agent
    this.verb        = verb
    this.indirectObj = indirectObj
    this.directObj   = directObj
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

    const verb = this.verb.conjugate(agentPer, agentNum)

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

module.exports = { EsObject, EsPronouns, EsVerb, EsVerbPhrase }
