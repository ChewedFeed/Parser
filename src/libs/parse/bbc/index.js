const bugfixes = require('bugfixes')

class Formatter {
  set image (image) {
    this._image = image
  }
  get image () {
    return this._image
  }
  set imageWidth (width) {
    this._width = width
  }
  get imageWidth () {
    return this._width
  }
  set imageHeight (height) {
    this._height = height
  }
  get imageHeight () {
    return this._height
  }

  set url (url) {
    this._url = url
  }
  get url () {
    return this._url
  }

  set title (title) {
    this._title = title
  }
  get title () {
    return this._title
  }

  set date (date) {
    this._date = date
  }
  get date () {
    return this._date
  }

  format (item) {
    this.title = item.title
    this.url = item.link
    this.date = item.date

    this.image = item.media.thumbnail.url
    this.imageHeight = item.media.thumbnail.height
    this.imageWidth = item.media.thumbnail.width
  }
}

module.exports = Formatter
