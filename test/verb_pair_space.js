// @flow
const assert = require('assert')
const suite  = require('mocha').suite
const test   = require('mocha').test

const conjugation_pattern_table = require('../src/es/conjugation_pattern_table')
const idiosyncratic_verb_conjugation_table =
  require('../src/es/idiosyncratic_verb_conjugation_table')
const infinitive_pair_table = require('../src/es/infinitive_pair_table')
const verb_pair_space = require('../src/es/verb_pair_space')

suite('verb_pair_space', function() {
  suite('lookupByL2', function() {
    test('idiosyncratic', function() {
      const verbPairs = verb_pair_space.lookupByL2("tenemos")
      assert.equal(verbPairs.length, 1)
      const v = verbPairs[0]
      assert.equal(v.l1(), "(we) have")
    })
    test('regular', function() {
      const verbPairs = verb_pair_space.lookupByL2("tengo")
      assert.equal(verbPairs.length, 1)
      const v = verbPairs[0]
      assert.equal(v.l1(), "(I) have")
    })
    test('stem change pret', function() {
      const verbPairs = verb_pair_space.lookupByL2("tuve")
      assert.equal(verbPairs.length, 1)
      const v = verbPairs[0]
      assert.equal(v.l1(), "(I) had")
    })
    test('stem change pres', function() {
      const verbPairs = verb_pair_space.lookupByL2("tiene")
      assert.equal(verbPairs.length, 1)
      const v = verbPairs[0]
      assert.equal(v.l1(), "(he/she/it) have")
    })
  })
})
