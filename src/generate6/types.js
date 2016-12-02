// @flow
export type Sexp = string|Array<Sexp>
export type Ref = string

function expectString(sexp:Sexp): string {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  return sexp.toString()
}

module.exports = { expectString }
