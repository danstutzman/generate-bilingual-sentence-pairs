// @flow
const assert = require('assert')
const { setup, suite, test } = require('mocha')
const parse_line = require('../src/generate5/parse_line')

const enClauses = require('../src/generate5/en/clauses')
const esClauses = require('../src/generate5/es/clauses')

suite('generate5', function() {
  suite('english', function() {
    test('B: what does A want ?', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,what)))')
      const translated = enClauses.translateIndependentClause(parsed,
        { short: true }).join(' ')
      assert.equal(translated, 'B: what does A want ?')
    })
  })
})
