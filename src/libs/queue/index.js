const bugfixes = require('bugfixes')
const AWS = require('aws-sdk')

class Queue {
  set feedId (feedId) {
    this._feedId = feedId
  }
  get feedId () {
    return this._feedId
  }

  addFeedId (callback) {
    let self = this

    let sqs = new AWS.SQS({
      apiVersion: process.env.AWS_SQS_VERSION
    })

    let feedObj = {
      feedId: this.feedId
    }
    let feedString = JSON.stringify(feedObj)

    sqs.sendMessage({
      MessageBody: feedString,
      QueueUrl: process.env.AWS_SQS_FEEDS
    }, (error, result) => {
      if (error) {
        bugfixes.error('SQS Error', error)

        return callback(error)
      }

      return callback(null, {
        success: true
      })
    })
  }
}

module.exports = Queue
