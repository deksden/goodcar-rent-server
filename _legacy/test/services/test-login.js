import { describe, it, beforeEach, before, after } from 'mocha'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import env from 'dotenv-safe'
import supertest from 'supertest'
import moment from 'moment'

chai.use(dirtyChai)

// test case:

/* All methods:
    findById:
    findOne:
    findAll:
    count:
    delete:
    clearData:
    update:
    create:
    createOrUpdate:
*/
describe('[service] login:', () => {
  env.config()
  process.env.NODE_ENV = 'test' // just to be sure

  let app = null
  let Login = null

  const context = {
    request: null,
    apiRoot: '',
    authSchema: 'Bearer',
    adminToken: null,
    userToken: null
  }

  before((done) => {
    App()
      .then((a) => {
        app = a
        context.request = supertest(app)
        Login = app.models.Login
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  after((done) => {
    app.storage.closeStorage()
      .then(() => done())
      .catch(done)
  })

  const data = [
    { id: '1', userId: '1', ip: '8.8.4.4' },
    { id: '2', userId: '2', ip: '127.0.0.1' },
    { id: '3', userId: '2', ip: '4.4.4.4' }
  ]

  beforeEach(function (done) {
    app.models.clearData()
      .then(() => Login.create(data[0]))
      .then(() => Login.create(data[1]))
      .then(() => Login.create(data[2]))
      .then(() => Login.count())
      .then((cnt) => {
        expect(cnt).to.exist('Cnt should exist')
        expect(cnt).is.equal(3)
      })
      .then(() => done())
      .catch((err) => done(err))
  })

  describe('findById method', () => {
    it('should find items', (done) => {
      Login.findById('2')
        .then((item) => {
          expect(item).to.exist('item should exist')
          expect(item.id).to.exist('item.id should exist')
          expect(item.id).is.equal('2')
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('findOne method', () => {
    it('should find one item', (done) => {
      Login.findOne({ where: { id: '2' } })
        .then((item) => {
          expect(item).to.exist('item should exist')
          expect(item.id).to.exist('item.id  should exist')
          expect(item.id).is.equal('2')
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('findAll method', () => {
    it('should find all items', (done) => {
      Login.findAll({ where: { userId: '2' } })
        .then((items) => {
          expect(items).to.exist('items  should exist')
          expect(items).to.be.an('array')
          expect(items).to.have.lengthOf(2)
          expect(items[0].userId).to.be.equal('2')
          expect(items[1].userId).to.be.equal('2')
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('count method', () => {
    it('should count items', (done) => {
      Login.count()
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('number')
          expect(res).to.be.equal(3)
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('removeById method', () => {
    it('should delete items', (done) => {
      Login.removeById('2')
        .then(() => Login.count())
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('number')
          expect(res).to.be.equal(2)
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('removeAll method', () => {
    it('should delete all specified items', (done) => {
      Login.removeAll({ where: { userId: '2' } })
        .then(() => Login.count())
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('number')
          expect(res).to.be.equal(1)
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('create method', () => {
    it('should create items', (done) => {
      Login.count()
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('number')
          expect(res).to.be.equal(3)
        })
        .then(() => Login.findById('1'))
        .delay(1000)
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('object')
          expect(res.createdAt).to.exist('res should exist')
          // expect(res.createdAt).to.be.an('number')
          const a = moment(res.createdAt)
          const b = moment()
          // console.log(a.format(), b.format())
          expect(a.isSameOrBefore(b)).to.be.true()
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })

  describe('createOrUpdate method', () => {
    it('should delete all specified items', (done) => {
      const aTimestamp = new Date()

      new Promise(resolve => setTimeout(resolve, 1100))
        .then(() => Login.createOrUpdate({ id: '2', userId: '2', ip: '127.0.0.1' }))
        .then(() => Login.findById('2'))
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res).to.be.an('object')
          expect(res.createdAt).to.exist('res.createdAt should exist')
          expect(new Date(res.createdAt) < (Date.now() + 1000)).to.be.true()
          expect(new Date(res.createdAt) > aTimestamp).to.be.true()
        })
        .then(() => {
          done()
        })
        .catch((err) => done(err))
    })
  })
})
