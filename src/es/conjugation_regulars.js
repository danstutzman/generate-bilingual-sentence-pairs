// @flow
import type { ConjugationRegular, ConjugationRegularPattern, Tense, Verb
  } from "./types";

var add = function(verb:Verb, pattern:ConjugationRegularPattern) : ConjugationRegular {
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
      l1:     l1,
      l2:     l2,
      person: pattern.person,
      number: pattern.number,
      tense:  pattern.tense,
    }
  } else {
    throw Error("Don't know how to conjugate '" + verb.l2 + "' with kindOfVerb '" +
      pattern.kindOfVerb + "'");
  }
}

module.exports = {
  add: add,
}
