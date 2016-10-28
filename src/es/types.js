// @flow

export type KindOfVerb =
  "-ar verb" |
  "-er verb" |
  "-ir verb" |
  "-er and -ir verbs" |
  "irregular preterite";

export type Tense = "pres" | "pret";

export type Person = 1 | 2 | 3;

export type Number = 1 | 2;

export type ConjugationPattern = {|
  kindOfVerb: KindOfVerb,
  tense:      Tense,
  person:     Person,
  number:     Number,
  suffix:     string,
|};

export type Infinitive = {|
  l2:     string,
  l1:     string,
  l1Past: string,
|};

export type Gender = "M" | "F";

export type ConjugatedVerb = {|
  l2:         string,
  l1:         string,
  infinitive: string,
  person:     Person,
  number:     Number,
  tense:      Tense,
|};

export type StemChange = {|
  tense:       Tense,
  infinitive:  string,
  stem:        string,
|};
