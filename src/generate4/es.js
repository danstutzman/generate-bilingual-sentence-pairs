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
  _11:    EsObject|void
  _21:    EsObject|void
  _31:    EsObject|void
  _12:   EsObject|void
  _32:   EsObject|void

  constructor(args:{|
    _11 ?:EsObject,
    _21 ?:EsObject,
    _31 ?:EsObject,
    _12 ?:EsObject,
    _32 ?:EsObject,
  |}) {
    this._11  = args._11
    this._21  = args._21
    this._31  = args._31
    this._12  = args._12
    this._32  = args._32
  }
  ifMatch<T>(object:EsObject, _11:T, _21:T, _31:T, _12:T, _32:T, otherwise:T,
      shouldUpdateOtherwise:bool): T {
    if (object === this._11)      { return _11 }
    else if (object === this._21) { return _21 }
    else if (object === this._31) { return _31 }
    else if (object === this._12) { return _12 }
    else if (object === this._32) { return _32 }
    else {
      if (shouldUpdateOtherwise) {
        this.update(object)
      }
      return otherwise
    }
  }
  update(newObject:EsObject) {
    switch (newObject.preferredPronoun) {
      case "yo/él": case "yo/ella":
        if (this._31 === undefined) {
          this._31 = newObject
        }
        break
      case "nosotros/ellos": case "nosotras/ellas":
        if (this._32 === undefined) {
          this._32 = newObject
        }
        break
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
  indirectObj: EsObject | null
  directObj:   EsObject

  constructor(agent:EsObject, verb:EsVerb, indirectObj:EsObject|null,
      directObj:EsObject) {
    this.agent       = agent
    this.verb        = verb
    this.indirectObj = indirectObj
    this.directObj   = directObj
  }
  toWords(pronouns:EsPronouns): Array<string> {
    const [agent, agentPer, agentNum]: [Array<string>, Per, Num] = pronouns.ifMatch(
      this.agent, [[], 1, 1], [[], 2, 1], [[], 3, 1], [[], 1, 2], [[], 3, 2],
      [this.agent.name, 3, this.agent.preferredPronoun.startsWith('n') ? 2 : 1],
      true)

    let indirectObjPronoun = (this.indirectObj === null) ? [] :
      pronouns.ifMatch(this.indirectObj,
        ['me'], ['te'], ['le'], ['nos'], ['les'], [], false)

    const directObjPronoun = pronouns.ifMatch(this.directObj,
      ['me'], ['te'], [this.directObj.preferredPronoun === 'yo/él' ? 'lo' : 'la'],
      ['nos'], [this.directObj.preferredPronoun == 'nosotros/ellos' ? 'los' : 'las'],
      [], false)

    if (['le', 'les'].indexOf(indirectObjPronoun) >= 0 &&
        ['lo', 'la', 'los', 'las'].indexOf(directObjPronoun) >= 0) {
      indirectObjPronoun = 'se'
    }

    const verb = this.verb.conjugate(agentPer, agentNum)

    const indirectObj = (this.indirectObj === null) ? [] :
      pronouns.ifMatch(this.indirectObj,
        [], [], [], [], [], ['a'].concat(this.indirectObj.name), true)

    const directObj = pronouns.ifMatch(this.directObj,
      [], [], [], [], [],
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
