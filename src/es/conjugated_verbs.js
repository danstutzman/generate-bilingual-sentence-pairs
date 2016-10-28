// @flow
import type { ConjugatedVerb, ConjugationPattern, Number, Person, Tense, Verb
  } from "./types";

var add_regular = function(verb:Verb, pattern:ConjugationPattern) : ConjugatedVerb {
  if (pattern.kindOfVerb === "-ar verb" && verb.l2.endsWith("ar") ||
      pattern.kindOfVerb === "-er verb" && verb.l2.endsWith("er") ||
      pattern.kindOfVerb === "-ir verb" && verb.l2.endsWith("ir") ||
      pattern.kindOfVerb === "-er and -ir verbs" && verb.l2.endsWith("er") ||
      pattern.kindOfVerb === "-er and -ir verbs" && verb.l2.endsWith("ir")) {
    var l1 = (pattern.tense == "pres") ?
      (verb.l1     + "(" + pattern.person + "," + pattern.number + ")") :
      (verb.l1Past + "(" + pattern.person + "," + pattern.number + ")");
    var l2 = verb.l2.substring(0, verb.l2.length - 2) + pattern.suffix.substring(1);
// next if $arc_type_to_l1_to_arc['conjugated_verb'][arc.l1]
    return {
      l1:         l1,
      l2:         l2,
      infinitive: verb.l2,
      person:     pattern.person,
      number:     pattern.number,
      tense:      pattern.tense,
    }
  } else {
    throw Error("Don't know how to conjugate '" + verb.l2 + "' with kindOfVerb '" +
      pattern.kindOfVerb + "'");
  }
}

var add_idiosyncratic = function(infinitive:string, tense:Tense, person:Person,
    number:Number, l2:string) : ConjugatedVerb {
  return {
    l1:          "TODO: English for " + l2,
    l2:          l2,
    infinitive:  infinitive,
    tense:       tense,
    person:      person,
    number:      number,
  }
}

add_idiosyncratic("ser",     "pres", 1, 1, "soy");
add_idiosyncratic("ser",     "pres", 2, 1, "eres");
add_idiosyncratic("ser",     "pres", 3, 1, "es");
add_idiosyncratic("ser",     "pres", 1, 2, "somos");
add_idiosyncratic("ser",     "pres", 3, 2, "son");
add_idiosyncratic("ser",     "pret", 1, 1, "fui");
add_idiosyncratic("ser",     "pret", 2, 1, "fuiste");
add_idiosyncratic("ser",     "pret", 3, 1, "fue");
add_idiosyncratic("ser",     "pret", 1, 2, "fuimos");
add_idiosyncratic("ser",     "pret", 3, 2, "fueron");
add_idiosyncratic("estar",   "pres", 1, 1, "estoy");
add_idiosyncratic("estar",   "pres", 2, 1, "estás");
add_idiosyncratic("estar",   "pres", 3, 1, "está");
add_idiosyncratic("estar",   "pres", 3, 2, "están");
add_idiosyncratic("tener",   "pres", 1, 1, "tengo");
add_idiosyncratic("hacer",   "pres", 1, 1, "hago");
add_idiosyncratic("decir",   "pres", 1, 1, "digo");
add_idiosyncratic("decir",   "pret", 3, 2, "dijeron");
add_idiosyncratic("ir",      "pres", 1, 1, "voy");
add_idiosyncratic("ir",      "pres", 2, 1, "vas");
add_idiosyncratic("ir",      "pres", 3, 1, "va");
add_idiosyncratic("ir",      "pres", 1, 2, "vamos");
add_idiosyncratic("ir",      "pres", 3, 2, "van");
add_idiosyncratic("ir",      "pret", 1, 1, "fui");
add_idiosyncratic("ir",      "pret", 2, 1, "fuiste");
add_idiosyncratic("ir",      "pret", 3, 1, "fue");
add_idiosyncratic("ir",      "pret", 1, 2, "fuimos");
add_idiosyncratic("ir",      "pret", 3, 2, "fueron");
add_idiosyncratic("ver",     "pres", 1, 1, "veo");
add_idiosyncratic("ver",     "pret", 1, 1, "vi");
add_idiosyncratic("ver",     "pret", 3, 1, "vio");
add_idiosyncratic("ver",     "pret", 1, 2, "vimos");
add_idiosyncratic("dar",     "pres", 1, 1, "doy");
add_idiosyncratic("dar",     "pret", 1, 1, "di");
add_idiosyncratic("dar",     "pret", 2, 1, "diste");
add_idiosyncratic("dar",     "pret", 3, 1, "dio");
add_idiosyncratic("dar",     "pret", 1, 2, "dimos");
add_idiosyncratic("dar",     "pret", 3, 2, "dieron");
add_idiosyncratic("saber",   "pres", 1, 1, "sé");
add_idiosyncratic("poner",   "pres", 1, 1, "pongo");
add_idiosyncratic("venir",   "pres", 1, 1, "vengo");
add_idiosyncratic("salir",   "pres", 1, 1, "salgo");
add_idiosyncratic("parecer", "pres", 1, 1, "parezco");
add_idiosyncratic("conocer", "pres", 1, 1, "conozco");
add_idiosyncratic("empezar", "pret", 1, 1, "empecé");
add_idiosyncratic("enviar",  "pres", 1, 1, "envío");
add_idiosyncratic("enviar",  "pres", 2, 1, "envías");
add_idiosyncratic("enviar",  "pres", 3, 1, "envía");
add_idiosyncratic("enviar",  "pres", 1, 2, "envían");

module.exports = {
  add_regular: add_regular,
}
