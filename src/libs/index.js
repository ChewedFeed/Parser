const Details = require('./details')
const Parser = require('./parse')
const Queue = require('./queue')
const Store = require('./store')

module.exports = {
  details: new Details(),
  parser: new Parser(),
  queue: new Queue(),
  store: new Store(),
}