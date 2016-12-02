// @flow
function merge(base:Object, additions:Object): Object {
  if (typeof base !== 'object') {
    throw new Error("Expected object for base but got " + JSON.stringify(base))
  }
  if (typeof additions !== 'object') {
    throw new Error("Expected object for additions but got " +
      JSON.stringify(additions))
  }

  let output = {}
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
module.exports = { merge }
