// @flow

export type ConjugationRegular = {|
  l2:      string,
  l1:      string,
  person:  Person,
  number:  Number,
  tense:   Tense,
|};

export type KindOfVerb = "-ar verb";

export type Tense = "pres";

export type Person = 1 | 2 | 3;

export type Number = 1 | 2;

export type Suffix = "-o" | "-as" | "-a";

export type ConjugationRegularPattern = {|
  kindOfVerb: KindOfVerb,
  tense:      Tense,
  person:     Person,
  number:     Number,
  suffix:     Suffix,
|};

export type Verb = {|
  l2:     string,
  l1:     string,
  l1Past: string,
|};

export type Gender = "M" | "F";
