const bugfixes = require('bugfixes')
const request = require('request')
const blind = require('blindparser')
const moment = require('moment')

const Store = require('../store')
const Details = require('../details')

class Parse {
  set url (url) {
    this._url = url
  }
  get url () {
    return this._url
  }

  set format (format) {
    this._format = format
  }
  get format () {
    return this._format
  }

  set feedId (feedId) {
    this._feedId = feedId
  }
  get feedId () {
    return this._feedId
  }

  parse (callback) {
    let feedItems = null
    let meta = null

    blind.parseURL(this.url, (error, result) => {
      if (error) {
        return callback('Parser Error', error)
      }

      meta = result.metadata
      let preDate = meta.lastBuildDate
      if (preDate) {
        let date = moment(preDate).unix()
        result.metadata.lastUpdated = date
      }

      return callback(null, result)
    })
  }

  item (item, callback) {
    let store = new Store()

    bugfixes.info('item store', item)

    let Formatter = require('./generic')
    if (this.format === 'bbc') {
      Formatter = require('./bbc')
    }

    let format = new Formatter()
    format.format(item)

    store.feedId = this.feedId
    store.url = format.url
    store.title = format.title
    store.imageDetails = {
      url: format.image,
      width: format.imageWidth,
      height: format.imageHeight
    }

    store.cacheCheck((error, result) => {
      if (error) {
        return callback(error)
      }

      if (result.skip === false) {
        store.insert((error, result) => {
          if (error) {
            return callback(error)
          }

          return callback(null, {
            success: true
          })
        })
      }
    })
  }

  items (items, callback) {
    for (let i = 0; i < items.length; i++) {
      this.item(items[i], (error, result) => {
        if (error) {
          return callback(error)
        }
      })
    }

    let details = new Details()
    details.feedId = this.feedId
    details.update((error, result) => {
      if (error) {
        return callback(error)
      }

      return callback(null, {
        success: true
      })
    })
  }
}

module.exports = Parse
