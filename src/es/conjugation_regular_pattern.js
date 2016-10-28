// @flow
import type { KindOfVerb, Tense, Person, Number, Suffix, ConjugationRegularPattern }
  from "./types";

var add = function(kindOfVerb:KindOfVerb, tense:Tense, person:Person, number:Number,
    suffix:Suffix) : ConjugationRegularPattern {
  return {
    kindOfVerb: kindOfVerb,
    tense:      tense,
    person:     person,
    number:     number,
    suffix:     suffix,
  }
}

add("-ar verb", "pres", 1, 1, "-o");
add("-ar verb", "pres", 2, 1, "-as");
add("-ar verb", "pres", 3, 1, "-a");
