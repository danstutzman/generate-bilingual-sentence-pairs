// @flow
import type { ConjugationPattern, Infinitive } from "../src/es/types";

var assert = require('assert');
var suite  = require('mocha').suite;
var test   = require('mocha').test;

var conjugated_verbs = require('../src/es/conjugated_verbs');

// given l2="digo" and userl1="he said",
//   l2_irregular_conjugation(1,pres,1,decir,digo)  -> BAD
//   say -> decir                                   -> GOOD

suite('conjugated_verbs', function() {
  test('add_regular', function() {
    var hablar:Infinitive = {
      l1:     "talk",
      l1Past: "talked",
      l2:     "hablar",
    };
    var pres11:ConjugationPattern = {
      kindOfVerb: "-ar verb",
      tense:      "pres",
      person:     1,
      number:     1,
      suffix:     "-o",
    };
    var verb = conjugated_verbs.add_regular(hablar, pres11);
    assert.deepEqual(verb, {
      l1:     "talk(1,1)",
      l2:     "hablo",
      number: 1,
      person: 1,
      tense:  "pres",
      infinitive: "hablar",
    });
  });
});
