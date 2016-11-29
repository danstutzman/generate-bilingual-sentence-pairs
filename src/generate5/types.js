// @flow
export type Sexp = string|Array<Sexp>

function expectString(sexp: Sexp): string {
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
  remove?:   'what' | 'why',
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

module.exports = { expectString, expectStatement, merge }
