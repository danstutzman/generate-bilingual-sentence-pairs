// @flow
const assert = require('assert')
const { setup, suite, test } = require('mocha')
const parse_line = require('../src/generate5/parse_line')
const enClauses      = require('../src/generate5/en/clauses')
const esClauses      = require('../src/generate5/es/clauses')
const { EnPronouns } = require('../src/generate5/en/pronouns')
const { EsPronouns } = require('../src/generate5/es/pronouns')

suite('generate5', function() {
  suite('english', function() {
    test('B asks A what A wants', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,,What)))')
      const translated = enClauses.translateIndependentClause(parsed,
        new EnPronouns(), {}).join(' ')
      assert.equal(translated, 'B asks A what A wants')
    })
    test('B: what does A want ?', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,,What)))')
      const translated = enClauses.translateSpeechActShort(parsed,
        new EnPronouns(), {}).join(' ')
      assert.equal(translated, 'B: what does A want ?')
    })
  })
  suite('spanish', function() {
    test('B pregunta a A lo que quiere A', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,,What)))')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({}), {}).join(' ')
      assert.equal(translated, 'B pregunta a A lo que quiere A')
    })
    test('B: qué quiere A ?', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,,What)))')
      const translated = esClauses.translateSpeechActShort(parsed,
        new EsPronouns({}), {}).join(' ')
      assert.equal(translated, 'B: qué quiere A ?')
    })

    test('(A) tengo B', function() {
      const parsed = parse_line.parseLine('have(A,,B)')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({yo:'A'}), {}).join(' ')
      assert.equal(translated, 'tengo B')
    })
    test('A tiene B', function() {
      const parsed = parse_line.parseLine('have(A,,B)')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({}), {}).join(' ')
      assert.equal(translated, 'A tiene B')
    })
    test('(A) tiene B', function() {
      const parsed = parse_line.parseLine('have(A,,B)')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({recent:['A']}), {}).join(' ')
      assert.equal(translated, 'tiene B')
    })
    test('AA tienen B', function() {
      const parsed = parse_line.parseLine('have(AA,,B)')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({}), {}).join(' ')
      assert.equal(translated, 'AA tienen B')
    })
    test('(AA) tienen B', function() {
      const parsed = parse_line.parseLine('have(AA,,B)')
      const translated = esClauses.translateIndependentClause(parsed,
        new EsPronouns({recent:['AA']}), {}).join(' ')
      assert.equal(translated, 'tienen B')
    })
  })
})
