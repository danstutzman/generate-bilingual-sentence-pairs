// @flow
const verb_pair_space = require('./verb_pair_space')

class VerbPhrasePair {
  l2: string
  l1: string
}

const table = [
  new VerbPhrasePair("leer algo",               "to read something"),
  new VerbPhrasePair("escribir algo a alguien", "to write someone something"),
  new VerbPhrasePair("beber algo",              "to drink something"),
  new VerbPhrasePair("comer algo",              "to eat something"),
  new VerbPhrasePair("estudiar algo",           "to study something"),
  new VerbPhrasePair("aprender algo",           "to learn something"),
  new VerbPhrasePair("recordar a alguien",      "to remember someone"),
  new VerbPhrasePair("recordar algo",           "to remember something"),
  new VerbPhrasePair("olvidar algo",            "to forget something"),
  new VerbPhrasePair("querer algo",             "to want something"),
  new VerbPhrasePair("gustar a alguien",        "to please someone"),
  new VerbPhrasePair("encantar a alguien",      "to enchant someone"),
  new VerbPhrasePair("odiar algo",              "to hate something"),
  new VerbPhrasePair("dar algo a alguien",      "to give something to someone"),
  new VerbPhrasePair("necesitar algo",          "to need something"),
  new VerbPhrasePair("enviar algo a alguien",   "to send someone something"),
  new VerbPhrasePair("ir a algún lugar",        "to go somewhere"),
  new VerbPhrasePair("estar a algún lugar",     "to be somewhere"),
  new VerbPhrasePair("usar algo",               "to use something"),
  new VerbPhrasePair("tener algo",              "to have something"),
  new VerbPhrasePair("viajar a algún lugar",    "to travel somewhere"),
  new VerbPhrasePair("ayudar a alguien",        "to help someone"),
  new VerbPhrasePair("comprar algo a alguien",  "to buy someone something"),
  new VerbPhrasePair("llamar a alguien",        "to call someone"),
  new VerbPhrasePair("llamar algo a alguien",   "to call someone something"),
  new VerbPhrasePair("tratar de hacer algo",    "to to try to do something"),
  new VerbPhrasePair("poder hacer algo",        "to can do something"),
  new VerbPhrasePair("decir algo a alguien",    "to say something to someone"),
  new VerbPhrasePair("preguntar algo a alguien","to ask someone something"),
  new VerbPhrasePair("pedir algo a alguien",    "to request something from someone"),
  new VerbPhrasePair("contar algo a alguien",   "to tell someone something"),
  new VerbPhrasePair("pensar en algo",          "to think about something"),
  new VerbPhrasePair("ir a hacer algo",         "to go to do something"),
  new VerbPhrasePair("tener que hacer algo",    "to have to do something"),
  new VerbPhrasePair("importar a alguien",      "to matter to someone"),
  new VerbPhrasePair("significar algo",         "to mean something"),
]

const lookupByL2 = function(l2:string): Array<VerbPhrasePair> {
  return [table[0]]
}

module.exports = {
  lookupByL2: lookupByL2,
  VerbPhrasePair: VerbPhrasePair,
}
