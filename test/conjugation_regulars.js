// @flow
import type { ConjugationRegularPattern, Verb } from "../src/es/types";

var assert = require('assert');
var suite  = require('mocha').suite;
var test   = require('mocha').test;

var nouns  = require('../src/es/nouns');
var verbs  = require('../src/es/verbs');
var conjugation_regulars = require('../src/es/conjugation_regulars');

suite('conjugation_regulars', function() {
  test('add', function() {
    var verb:Verb = {
      l1:     "talk",
      l1Past: "talked",
       l2:     "hablar",
    };
    var pattern:ConjugationRegularPattern = {
      kindOfVerb: "-ar verb",
      tense:      "pres",
      person:     1,
      number:     1,
      suffix:     "-o",
    };
    var conjugation = conjugation_regulars.add(verb, pattern);
    assert.deepEqual(conjugation, {
      l1: "talk(1,1)",
      l2: "hablo",
      number: 1,
      person: 1,
      tense: "pres",
    });
  });
});
