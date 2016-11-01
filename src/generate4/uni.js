// @flow
const { EnObject, EnPronouns, EnVerbPhrase } = require('./en')
const { EsObject, EsPronouns, EsVerb, EsVerbPhrase } = require('./es')

class UniVP3 {
  agent:        string
  enInfinitive: string
  receiver:     string
  object:       string

  constructor(agent:string, enInfinitive:string, receiver:string, object:string) {
    this.agent        = agent
    this.enInfinitive = enInfinitive
    this.receiver     = receiver
    this.object       = object
  }
  toEn(enObjectByName: {[name:string]: EnObject}): EnVerbPhrase {
    const verbPlural = this.enInfinitive
    const verbSingular = {
      give: 'gives'
    }[verbPlural]
    const lookup = function(key:string): EnObject {
      const val = enObjectByName[key]
      if (val === undefined) { throw new Error("Can't find object for key " + key) }
      return val
    }
    return new EnVerbPhrase(
      lookup(this.agent),
      verbSingular, verbPlural,
      lookup(this.receiver),
      lookup(this.object))
  }
  toEs(esObjectByName: {[name: string]: EsObject}): EsVerbPhrase {
    const verb = {
      give: new EsVerb('doy', 'das', 'da', 'damos', 'dan'),
    }[this.enInfinitive]

    const lookup = function(key:string): EsObject {
      const val = esObjectByName[key]
      if (val === undefined) { throw new Error("Can't find object for key " + key) }
      return val
    }

    return new EsVerbPhrase(
      lookup(this.agent),
      verb,
      lookup(this.receiver),
      lookup(this.object))
  }
}

module.exports = { EnObject, EnPronouns, EsObject, EsPronouns, UniVP3 }
