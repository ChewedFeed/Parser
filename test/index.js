/* global it, describe */
require('dotenv').config()
const bugfixes = require('bugfixes')

const expect = require('chai').expect

const underTest = require('../src/index')

const payLoad = {
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:eu-west-2:314171142973:feeds:9c9398ba-ac25-46ed-98ea-c449336fa6bd",
      "Sns": {
        "Type": "Notification",
        "MessageId": "cd8c40cf-5be1-5025-992f-134ebf896806",
        "TopicArn": "arn:aws:sns:eu-west-2:314171142973:feeds",
        "Subject": null,
        "Message": "{\"feedId\":\"503ae01a-34d7-5dc2-b0b6-adbc29ebbc5c\"}",
        "Timestamp": "2018-05-25T10:15:04.678Z",
        "SignatureVersion": "1",
        "Signature": "BZ0Kdu2/596suGiIjIH3yp8nNKY9lkJ34GGyrb4BjC23mqW09vBl5Ju2R9wRe2Vv0n7bWEI7ou6oqO4wNcRdfIkCx40opX2lPKJInFpcfUa3uY/kpj1sBxaXyuW9xZrIF1e/guPA5vq3Clj2b1NHbHcaK8o2wg6RegsZnFY6fiQZiGD35bUMaqWGdRSuYoledaBJa5yUcoNSZExuMRrdRv8KwsvcD5ihqWw3U25jGTobHRLnROSNyF4wfs4g8ymGuMzzeYWbsHLYrtUwrvrnEAQw5F9DtikQr8h0CWc1SHXfr58DK5njessX/tPgQ7/HrX+4RENaEZ9o9bJE1DehNw==",
        "SigningCertUrl": "https://sns.eu-west-2.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem",
        "UnsubscribeUrl": "https://sns.eu-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-2:314171142973:feeds:9c9398ba-ac25-46ed-98ea-c449336fa6bd",
        "MessageAttributes": {}
      }
    }
  ]
}

describe('Feed Parser', () => {
  it('it should parse the feed', (done) => {
    underTest(payLoad, console, (error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('body')

      let resultObj = JSON.parse(result.body)
      expect(resultObj).to.have.property('message')
      expect(resultObj.message).to.have.property('success')
      expect(resultObj.message.success).to.be.equal(true)

      done()
    })
  })

  it('it should skip lastUpdated less than 1h', (done) => {
    underTest(payLoad, console, (error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('body')

      let resultObj = JSON.parse(result.body)
      expect(resultObj).to.have.property('message')
      expect(resultObj.message).to.have.property('success')
      expect(resultObj.message.success).to.be.equal(false)

      done()
    })
  })
})