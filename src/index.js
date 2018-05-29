const bugfixes = require('bugfixes')
const libs = require('chewedfeed')

const bugfunctions = bugfixes.functions

module.exports = (event, context, callback) => {
  let body = JSON.parse(event.Records[0].Sns.Message)

  const details = libs.details
  details.feedId = body.feedId
  details.getFeed((error, result) => {
    if (error) {
      bugfixes.error('GetFeed', error)

      return callback(null, bugfunctions.lambdaError(100, {
        success: false,
        error: error
      }))
    }

    if (result.skip === false) {
      bugfixes.info('Skipped', result)

      return callback(null, bugfunctions.lambdaResult(101, {
        success: false
      }))
    }

    const parse = libs.parser
    parse.feedId = body.feedId
    parse.url = result.url
    parse.format = result.format
    parse.parse((error, result) => {
      if (error) {
        bugfixes.error('Parse', error)

        return callback(null, bugfunctions.lambdaError(102, {
          error: error,
          success: false
        }))
      }

      parse.items(result.items, (error, result) => {
        if (error) {
          bugfixes.error('Items', error)

          return callback(null, bugfunctions.lambdaError(103, {
            error: error,
            success: false
          }))
        }

        return callback(null, bugfunctions.lambdaResult(104, {
          success: true
        }))
      })
    })
  })
}
