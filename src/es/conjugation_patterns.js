// @flow
import type { KindOfVerb, Tense, Person, Number, ConjugationPattern }
  from "./types";

var add = function(kindOfVerb:KindOfVerb, tense:Tense, person:Person, number:Number,
    suffix:string) : ConjugationPattern {
  return {
    kindOfVerb: kindOfVerb,
    tense:      tense,
    person:     person,
    number:     number,
    suffix:     suffix,
  }
}

add("-ar verb",            "pres", 1, 1, "-o");
add("-ar verb",            "pres", 2, 1, "-as");
add("-ar verb",            "pres", 3, 1, "-a");
add("-ar verb",            "pres", 1, 2, "-amos");
add("-ar verb",            "pres", 3, 2, "-an");
add("-ar verb",            "pret", 1, 1, "-é");
add("-ar verb",            "pret", 2, 1, "-aste");
add("-ar verb",            "pret", 3, 1, "-ó");
add("-ar verb",            "pret", 1, 2, "-amos");
add("-ar verb",            "pret", 3, 2, "-aron");
add("-er and -ir verbs",   "pres", 1, 1, "-o");
add("-er and -ir verbs",   "pres", 2, 1, "-es");
add("-er and -ir verbs",   "pres", 3, 1, "-e");
add("-er and -ir verbs",   "pres", 3, 2, "-en");
add("-er and -ir verbs",   "pret", 1, 1, "-í");
add("-er and -ir verbs",   "pret", 2, 1, "-iste");
add("-er and -ir verbs",   "pret", 3, 1, "-ió");
add("-er and -ir verbs",   "pret", 1, 2, "-imos");
add("-er and -ir verbs",   "pret", 3, 2, "-ieron");
add("-er verb",            "pres", 1, 2, "-emos");
add("-ir verb",            "pres", 1, 2, "-imos");
add("irregular preterite", "pret", 1, 1, "-e");
add("irregular preterite", "pret", 2, 1, "-iste");
add("irregular preterite", "pret", 3, 1, "-o");
add("irregular preterite", "pret", 1, 2, "-imos");
add("irregular preterite", "pret", 3, 2, "-ieron");
