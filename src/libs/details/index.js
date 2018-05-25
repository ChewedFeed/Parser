const bugfixes = require('bugfixes')
const AWS = require('aws-sdk')
const uuid = require('uuid/v5')
const moment = require('moment')

const Queue = require('../queue')

const bugfunctions = bugfixes.functions

class Details {
  set url (url) {
    this._url = url
  }
  get url () {
    return this._url
  }

  set id (id) {
    this._id = id
  }
  get id () {
    return this._id
  }

  set title (title) {
    this._title = title
  }
  get title () {
    return this._title
  }

  set format (format) {
    this._format = format
  }
  get format () {
    return this._format
  }

  checkInCache (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT
    })
    dynamo.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_FEEDS,
      ExpressionAttributeNames: {
        '#url': 'url',
        '#id': 'feedId'
      },
      ExpressionAttributeValues: {
        ':url': self.url
      },
      FilterExpression: '#url = :url',
      ProjectionExpression: '#id'
    }, (error, result) => {
      if (error) {
        bugfixes.info('Cache Check', error)

        return callback(error)
      }

      if (result.Items[0]) {
        if (result.Items[0].feedId) {
          return callback(null, {
            inCache: true
          })
        }
      }

      return callback(null, {
        inCache: false
      })
    })
  }

  add (callback) {
    let self = this
    let feedId = uuid(self.url, uuid.DNS)

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT
    })
    dynamo.put({
      TableName: process.env.AWS_DYNAMO_TABLE_FEEDS,
      Item: {
        url: self.url,
        title: self.title,
        feedId: feedId
      }
    }, (error, result) => {
      if (error) {
        bugfixes.error('Details Add', error)

        return callback(error)
      }

      const queue = new Queue()
      queue.feedId = feedId
      queue.addFeedId((error, result) => {
        if (error) {
          return callback(error)
        }

        return callback(null, {
          success: true
        })
      })
    })
  }

  getFeed (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT
    })
    dynamo.get({
      TableName: process.env.AWS_DYNAMO_TABLE_FEEDS,
      Key: {
        feedId: self.feedId
      }
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      let resultSet = {
        url: result.Item.url,
        format: result.Item.format,
        skip: true,
        success: true
      }

      if (result.Item.lastUpdated) {
        if (result.Item.lastUpdated < moment.unix()) {
          resultSet.skip = false
        }
      }

      return callback(null, resultSet)
    })
  }

  update (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT
    })
    dynamo.update({
      TableName: process.env.AWS_DYNAMO_TABLE_FEEDS,
      Key: {
        feedId: self.feedId
      },
      ConditionExpression: '#feedId = :feedId',
      UpdateExpression: 'SET #lastUpdated = :lastUpdated',
      ExpressionAttributeNames: {
        '#lastUpdated': 'lastUpdated',
        '#feedId': 'feedId'
      },
      ExpressionAttributeValues: {
        ':lastUpdated': moment().unix(),
        ':feedId': self.feedId
      }
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      return callback(null, {
        success: true
      })
    })
  }
}

module.exports = Details
