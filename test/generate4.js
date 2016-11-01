// @flow
const assert = require('assert')
const suite  = require('mocha').suite
const test   = require('mocha').test

const generate4 = require('../src/generate4')
const { EnObject, EnPronouns, EsObject, EsPronouns, UniVP3 } = generate4

suite('generate4', function() {
  test('testEnglish', function() {
    const Maria  = new EnObject(['Maria'], 'I/she')
    const Dan    = new EnObject(['Dan'], 'I/he')
    const Robot  = new EnObject(['the', 'robot'], 'I/it')
    const Robots = new EnObject(['the', 'robots'], 'we/they')
    const objects = { Maria, Dan, Robot, Robots }

    const story = new UniVP3('Dan', 'give', 'Dan', 'Robot')
    const words = story.toEn(objects).toWords(new EnPronouns({ me: Dan }))
    assert.deepEqual(words.join(' '), 'I give myself the robot')
  })
  test('testSpanish', function() {
    const Maria   = new EsObject(['María'], 'yo/ella', true)
    const Dan     = new EsObject(['Dan'], 'yo/él', true)
    const Robot   = new EsObject(['el', 'robot'], 'yo/él', false)
    const Robots  = new EsObject(['los', 'robots'], 'nosotros/ellos', false)
    const Friend  = new EsObject(['un', 'amigo'], 'yo/él', true)
    const Friends = new EsObject(['amigos'], 'nosotros/ellos', true)
    const Gifts   = new EsObject(['regalos'], 'nosotros/ellos', false)
    const objects = { Maria, Dan, Robot, Robots, Friend, Friends, Gifts }

    // Ellos me los dan.
    const vp = new UniVP3('Friend', 'give', 'Dan', 'Gifts').toEs(objects)
    const words = vp.toWords(new EsPronouns({ _3s: Friend }))
    assert.deepEqual(words.join(' '), 'da a Dan regalos')
  })
})
