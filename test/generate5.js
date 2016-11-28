// @flow
const assert = require('assert')
const { setup, suite, test } = require('mocha')
const parse_line = require('../src/generate5/parse_line')

const enClauses = require('../src/generate5/en/clauses')
const esClauses = require('../src/generate5/es/clauses')

suite('generate5', function() {
  suite('english', function() {
    test('B: what did A want ?', function() {
      const parsed = parse_line.parseLine('ask(B,A,what(want(A,what)))')
      assert.equal(enClauses.translateIndependentClause(parsed,
          { negative: false, past: false, short: true }).join(' '), 'B: what did A want ?')
    })
  })
})
