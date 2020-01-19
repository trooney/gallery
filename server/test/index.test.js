/**
 * HI THERE!
 * 
 * This isn't really tested. Just a few sanity checks.
 */

const chai = require('chai')
chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

if (process.env.NODE_ENV !== 'test') {
  console.log('Fatal Error: NODE_ENV must be set to test')
  process.exit(1)
}

const app = require('../src/app.js')

// @NOTE For simplicy, lets just download this image for tests. 
//       Then later on maybe we can mock the actual downloadImage
//       function... If this URL goes down, the test will fail.
const FIXTURE_URL = 'https://picsum.photos/1'

describe('GET /api/photos', () => {
  it('should return a normalized, albeit empty, response', done => {
    chai
      .request(app)
      .get('/api/photos')
      .end((err, res) => {
        res.status.should.equal(200)
        res.type.should.equal('application/json')
        res.body.should.include.keys('photos', 'topics', 'tags')
      })
    done()
  })
})

describe('POST /api/photos', () => {
  it('handles failure cases', done => {
    chai
      .request(app)
      .post('/api/photos')
      .end((err, res) => {
        res.status.should.equal(500)
        done()
      })  
  })
  it('handles success cases', done => {
    chai
      .request(app)
      .post('/api/photos')
      .send({
        photo: {
          src: FIXTURE_URL,
          tags: [],
          topics: []
        }
      })
      .end((err, res) => {
        res.status.should.equal(200)
        res.body.should.include.keys('photo')
        res.body.photo.should.include.keys('hash', 'url')
        done()
      })
  })
})