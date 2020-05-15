/* eslint-env mocha */
import { describe, it, before, beforeEach } from 'mocha'
import Moment from 'moment'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import {
  expected,
  createAdminUser,
  inviteCreate,
  inviteList,
  loginAs,
  UserAdmin,
  UserFirst, inviteSend
} from '../client/client-api'
import env from 'dotenv-safe'

chai.use(dirtyChai)

// test case:
describe('(controller) invite', function () {
  env.config()
  process.env.NODE_ENV = 'test' // just to be sure

  let app = null

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

  beforeEach(function (done) {
    app.models.clearData()
      .then(() => app.models.UserGroup.createSystemData())
      .then(() => createAdminUser(context))
      .then(() => loginAs(context, UserAdmin))
      .then(() => done())
  })

  describe('create method:', function () {
    describe('should fail with invalid params:', function () {
      it('Empty email', function (done) {
        inviteCreate(context, { email: '' }, expected.ErrCodeInvalidParams)
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body.message).to.exist('')
            expect(res.body.error).to.exist('')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })
      it('Email is null', function (done) {
        inviteCreate(context, { email: null }, expected.ErrCodeInvalidParams)
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body.message).to.exist('')
            expect(res.body.error).to.exist('')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })
    })

    describe('should be ok with proper params:', function () {
      const aMoment = (Moment(Date.now() + 1000 * 60 * 60 * 24)).format()

      it('should be ok with email only', function (done) {
        inviteCreate(context, { email: 'user@email.com' })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
      it('should be ok with email and expireAt only', function (done) {
        inviteCreate(context, { email: 'user@email.com', expireAt: aMoment })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
      it('should be ok with email and disabled', function (done) {
        inviteCreate(context, { email: 'user@email.com', disabled: true })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
      it('should be ok with full pack - email, expireAt and disabled', function (done) {
        inviteCreate(context, { email: 'user@email.com', expireAt: aMoment, disabled: true })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
    })
  })

  describe('send method:', function () {
    // mock mail service for app:
    const mailerData = {}
    before(function (done) {
      app.mail = (to, subject, message) => {
        mailerData.to = to
        mailerData.subject = subject
        mailerData.message = message
        if (app.env.NODE_ENV === 'development' || app.env.NODE_ENV === 'test') {
          console.log('sent: ')
          console.log(`to: ${to} subject: ${subject}\n\r
            message: ${message}`)
        }
      }
      done()
    })

    describe('should be ok with proper params:', function () {
      it('send with fake email', function (done) {
        inviteCreate(context, { email: UserFirst.email })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body.id).to.exist('')
            return inviteSend(context, res.body)
          })
          .then((res) => {
            expect(res.statusCode).is.equal(200)
            expect(mailerData.to).is.equal(UserFirst.email)
            done()
          })
          .catch((err) => {
            done(err)
          })
      })
    })
  })
})
