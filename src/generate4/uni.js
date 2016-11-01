// @flow
const { EnObject, EnPronouns, EnVerbPhrase } = require('./en')
const { EsObject, EsPronouns, EsVerb, EsVerbPhrase } = require('./es')

class UniVP3 {
  agent:        string
  enInfinitive: string
  receiver:     string | null
  object:       string

  constructor(agent:string, enInfinitive:string, receiver:string|null, object:string) {
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
      (this.receiver === null) ? null : lookup(this.receiver),
      lookup(this.object))
  }
  toEs(esObjectByName: {[name: string]: EsObject}): EsVerbPhrase {
    const verb = {
      call: new EsVerb('llamo', 'llamas', 'llama', 'llamamos','llaman'),
      eat:  new EsVerb( 'como',  'comes',  'come', 'comemos',  'comen'),
      give: new EsVerb('  doy',    'das',    'da',   'damos',    'dan'),
      have: new EsVerb('tengo', 'tienes', 'tiene', 'tenemos', 'tienen'),
      love: new EsVerb(  'amo',   'amas',   'ama',  'amamos',   'aman'),
      see:  new EsVerb(  'veo',    'ves',    've',   'vemos',    'ven'),
      know_person: new EsVerb('conozco', 'conoces', 'concoce', 'conocemos', 'conocen'),
    }[this.enInfinitive]
    if (verb === undefined) {
      throw new Error("Can't find EsVerb for " + this.enInfinitive)
    }

    const lookup = function(key:string): EsObject {
      const val = esObjectByName[key]
      if (val === undefined) { throw new Error("Can't find object for key " + key) }
      return val
    }

    return new EsVerbPhrase(
      lookup(this.agent),
      verb,
      (this.receiver === null) ? null : lookup(this.receiver),
      lookup(this.object))
  }
}

module.exports = { EnObject, EnPronouns, EsObject, EsPronouns, UniVP3 }
