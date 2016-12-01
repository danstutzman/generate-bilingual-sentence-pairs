// @flow
export type Sexp = string|Array<Sexp>
export type Noun = string

function expectNoun(sexp:Sexp, required:bool): Noun {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  const noun = sexp.toString()
  if (['', 'A', 'B', 'AA'].indexOf(noun) === -1) {
    throw new Error("Unknown noun '" + noun + "'")
  }
  if (noun === '' && required) {
    throw new Error("Blank noun not allowed here")
  }
  return noun
}

function expectString(sexp:Sexp): Noun {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  return sexp.toString()
}

function expectStatement(sexp: Sexp): Sexp {
  if (typeof sexp === 'string') {
    throw new Error("Expected Array<string> but got " + sexp.toString())
  }
  return sexp
}

export type Features = {|
  negative?: bool,
  past?:     bool,
  remove?:   'What' | 'Why',
  invert?:   bool,
|}

function merge(base: Features, additions: Features): Features {
  if (typeof base !== 'object') {
    throw new Error("Expected object for base but got " + JSON.stringify(base))
  }
  if (typeof additions !== 'object') {
    throw new Error("Expected object for additions but got " +
      JSON.stringify(additions))
  }

  let output: Features = { negative: false }
  for (const key in base) {
    if (base.hasOwnProperty(key)) {
      output[key] = base[key]
    }
  }
  for (const key in additions) {
    if (additions.hasOwnProperty(key)) {
      output[key] = additions[key]
    }
  }
  return output
}

module.exports = { expectNoun, expectString, expectStatement, merge }
