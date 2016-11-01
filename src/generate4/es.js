// @flow

type Per = 1 | 2 | 3
type Num = 1 | 2

type EsPreferredPronoun = "yo/él" | "yo/ella" | "nosotros/ellos" | "nosotras/ellas"

class EsObject {
  name: Array<string>
  preferredPronoun: EsPreferredPronoun
  isPerson: bool

  constructor(name:Array<string>, preferredPronoun:EsPreferredPronoun,
      isPerson: bool) {
    this.name             = name
    this.preferredPronoun = preferredPronoun
    this.isPerson         = isPerson
  }
}

type EsPronounsInit<T> = {|
  _11   ?:T, // yo, me
  _21   ?:T, // tú, te, ti
  _31   ?:T, //                  individual
  el    ?:T, // masculine person individual
  ella  ?:T, // feminine  person individual
  lo    ?:T, // masculine        individual
  la    ?:T, // feminine         individual
  le    ?:T, //           person individual
  _12   ?:T, // nosostros, nos
  _32   ?:T, //                  group
  ellos ?:T, // masc/mixd person group
  ellas ?:T, // feminine  person group
  los   ?:T, // masc/mixd        group
  las   ?:T, // feminine         group
|}

class EsPronouns {
  _11:    Array<EsObject>
  _21:    Array<EsObject>
  _31:    Array<EsObject>
  el:     Array<EsObject>
  ella:   Array<EsObject>
  lo:     Array<EsObject>
  la:     Array<EsObject>
  le:     Array<EsObject>
  _12:    Array<EsObject>
  _32:    Array<EsObject>
  ellos:  Array<EsObject>
  ellas:  Array<EsObject>
  los:    Array<EsObject>
  las:    Array<EsObject>

  constructor(args:EsPronounsInit<EsObject>) {
    this._11   = args._11   ? [args._11]   : []
    this._21   = args._21   ? [args._21]   : []
    this._31   = args._31   ? [args._31]   : []
    this.el    = args.el    ? [args.el]    : []
    this.ella  = args.ella  ? [args.ella]  : []
    this.lo    = args.lo    ? [args.lo]    : []
    this.la    = args.la    ? [args.la]    : []
    this.le    = args.le    ? [args.le]    : []
    this._12   = args._12   ? [args._12]   : []
    this._32   = args._32   ? [args._32]   : []
    this.ellos = args.ellos ? [args.ellos] : []
    this.ellas = args.ellas ? [args.ellas] : []
    this.los   = args.los   ? [args.los]   : []
    this.las   = args.las   ? [args.las]   : []
  }
  ifMatch<T>(object:EsObject, args:EsPronounsInit<T>, otherwise:T,
      shouldUpdateOtherwise:bool): T {
    if        (args._11   && this._11.indexOf(object) != -1)  {
      return args._11
    } else if (args._21   && this._21.indexOf(object) != -1)  {
      return args._21
    } else if (args._31   && this._31.indexOf(object) != -1)  {
      return args._31
    } else if (args.el    && this.el.indexOf( object) != -1)   {
      return args.el
    } else if (args.ella  && this.ella.indexOf(object) != -1) {
      return args.ella
    } else if (args.lo    && this.lo.indexOf( object) != -1)   {
      return args.lo
    } else if (args.la    && this.la.indexOf( object) != -1)   {
      return args.la
    } else if (args.le    && this.le.indexOf( object) != -1)   {
      return args.le
    } else if (args._12   && this._12.indexOf(object) != -1)  {
      return args._12
    } else if (args._32   && this._32.indexOf(object) != -1)  {
      return args._32
    } else if (args.ellos && this.ellos.indexOf( object) != -1)   {
      return args.ellos
    } else if (args.ellas && this.ellas.indexOf( object) != -1)   {
      return args.ellas
    } else if (args.los   && this.los.indexOf( object) != -1)   {
      return args.los
    } else if (args.las   && this.las.indexOf( object) != -1)   {
      return args.las
    } else {
      if (shouldUpdateOtherwise) {
        this.update(object)
      }
      return otherwise
    }
  }
  update(newObject:EsObject) {
    switch (newObject.preferredPronoun) {
      case "yo/él":
        if (this._31 .indexOf(newObject) === -1) { this._31 .push(newObject) }
        if (this.el  .indexOf(newObject) === -1 && newObject.isPerson) {
          this.el.push(newObject) }
        if (this.lo  .indexOf(newObject) === -1) { this.lo  .push(newObject) }
        if (this.le  .indexOf(newObject) === -1 && newObject.isPerson) {
          this.le.push(newObject) }
        break
      case "yo/ella":
        if (this._31 .indexOf(newObject) === -1) { this._31 .push(newObject) }
        if (this.ella.indexOf(newObject) === -1 && newObject.isPerson) {
          this.ella.push(newObject) }
        if (this.la  .indexOf(newObject) === -1) { this.la  .push(newObject) }
        if (this.le  .indexOf(newObject) === -1 && newObject.isPerson) {
          this.le.push(newObject) }
        break
      case "nosotros/ellos":
        if (this._32  .indexOf(newObject) === -1) { this._32 .push(newObject) }
        if (this.ellos.indexOf(newObject) === -1) { this.ellos.push(newObject) }
        if (this.los  .indexOf(newObject) === -1) { this.los.push(newObject) }
        break
      case "nosotras/ellas":
        if (this._32  .indexOf(newObject) === -1) { this._32 .push(newObject) }
        if (this.ellas.indexOf(newObject) === -1) { this.ellas.push(newObject) }
        if (this.las  .indexOf(newObject) === -1) { this.las.push(newObject) }
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
      this.agent, {
        _11:   [[],        1, 1],
        _21:   [[],        2, 1],
        _31:   [[],        3, 1],
        el:    [['él'],    3, 1],
        ella:  [['ella'],  3, 1],
        _12:   [[],        1, 2],
        _32:   [[],        3, 2],
        ellos: [['ellos'], 3, 2],
        ellas: [['ellas'], 3, 2],
      }, [this.agent.name, 3, this.agent.preferredPronoun.startsWith('n') ? 2 : 1],
      true)

    let indirectObjPronoun = (this.indirectObj === null) ? [] :
      pronouns.ifMatch(this.indirectObj, {
        _11:  ['me'],
        _21:  ['te'],
        _12:  ['nos'],
      }, ['le'], false)

    const directObjPronoun = pronouns.ifMatch(this.directObj, {
      _11: ['me'],
      _21: ['te'],
      lo:  ['lo'],
      la:  ['la'],
      _12: ['nos'],
      los: ['los'],
      las: ['las'],
    }, [], false)

    if (['le', 'les'].indexOf(indirectObjPronoun) >= 0 &&
        ['lo', 'la', 'los', 'las'].indexOf(directObjPronoun) >= 0) {
      indirectObjPronoun = 'se'
    }

    const verb = this.verb.conjugate(agentPer, agentNum)

    const indirectObj = (this.indirectObj === null) ? [] :
      pronouns.ifMatch(this.indirectObj, {
        _11: [],
        _21: [],
        le:  [],
      }, ['a'].concat(this.indirectObj.name), true)

    const directObj = pronouns.ifMatch(this.directObj, {
      _11:  [],
      _21:  [],
      el:   ['a', 'él'],
      ella: ['a', 'ella'],
      lo:   [],
      la:   [],
      los:  [],
      las:  [],
      _12:  [],
    }, (this.directObj.needsPersonalA ? ['a'] : []).concat(this.directObj.name), true)

    return agent
      .concat(indirectObjPronoun)
      .concat(directObjPronoun)
      .concat([verb])
      .concat(indirectObj)
      .concat(directObj)
  }
}

module.exports = { EsObject, EsPronouns, EsVerb, EsVerbPhrase }
