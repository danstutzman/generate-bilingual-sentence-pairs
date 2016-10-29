// @flow
var assert = require('assert')
var suite  = require('mocha').suite
var test   = require('mocha').test

var conjugation_pattern_table = require('../src/es/conjugation_pattern_table')
var idiosyncratic_verb_conjugation_table =
  require('../src/es/idiosyncratic_verb_conjugation_table')
var infinitive_pair_table = require('../src/es/infinitive_pair_table')
var verb_pair_space = require('../src/es/verb_pair_space')

suite('verb_pair_space', function() {
  suite('lookupByL2', function() {
    test('idiosyncratic', function() {
      var verbPairs = verb_pair_space.lookupByL2("tenemos")
      assert.equal(verbPairs.length, 1)
      var v = verbPairs[0]
      assert.equal(v.l1(), "have")
      assert.deepEqual(v.tense_person_number(), ["pres", 1, 2])
    })
    test('regular', function() {
      var verbPairs = verb_pair_space.lookupByL2("tengo")
      assert.equal(verbPairs.length, 1)
      var v = verbPairs[0]
      assert.equal(v.l1(), "have")
      assert.deepEqual(v.tense_person_number(), ["pres", 1, 1])
    })
    test('stem change pret', function() {
      var verbPairs = verb_pair_space.lookupByL2("tuve")
      assert.equal(verbPairs.length, 1)
      var v = verbPairs[0]
      assert.equal(v.l1(), "have")
      assert.deepEqual(v.tense_person_number(), ["pret", 1, 1])
    })
    test('stem change pres', function() {
      var verbPairs = verb_pair_space.lookupByL2("tiene")
      assert.equal(verbPairs.length, 1)
      var v = verbPairs[0]
      assert.equal(v.l1(), "have")
      assert.deepEqual(v.tense_person_number(), ["pres", 3, 1])
    })
  })
})
