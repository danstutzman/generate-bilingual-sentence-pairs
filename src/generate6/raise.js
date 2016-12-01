// @flow

function raise(message:string) {
  throw new Error(message)
}

module.exports = { raise }
