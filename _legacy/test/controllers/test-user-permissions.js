/* eslint-env mocha */
import { describe, it, beforeEach, before } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import _ from 'lodash'
import App from '../../app'
import {
  createAdminUser,
  inviteCreate,
  loginAs,
  UserAdmin,
  UserFirst,
  aclUserList,
  aclUserCreate,
  createUser, userPermissions
} from '../client/client-api'
import env from 'dotenv-safe'

chai.use(dirtyChai)

// test case:
describe('(controller) user-permissions:', function () {
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
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.email).to.exist('res.body.email should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.UserAdminId = res.body.id
        return loginAs(context, UserAdmin)
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.token).to.exist('res.body.token should exist')
        context.adminToken = context.token
        return inviteCreate(context, { email: UserFirst.email })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.userInvite = res.body.id
        return createUser(context, _.merge({}, UserFirst, { invite: context.userInvite }))
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.email).to.exist('res.body.email should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.UserFirstId = res.body.id
        return loginAs(context, UserFirst)
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.token).to.exist('res.body.token should exist')
        context.userToken = context.token
      })
      .then(() => {
        context.token = context.adminToken
        return aclUserCreate(context,
          context.UserFirstId,
          {
            object: '/auth/invite',
            permission: 'read',
            kind: app.consts.kindAllow
          })
      })
      .then(() => done())
      .catch((err) => {
        done(err)
      })
  })

  describe('list/create method:', function () {
    it('should list permissions in system:', function (done) {
      aclUserList(context, context.UserFirstId)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0].object).to.exist()
          expect(res.body[0].permission).to.exist()
          expect(res.body[0].kind).to.exist()
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })

    it('should list same permissions for specified user:', function (done) {
      userPermissions(context, context.UserFirstId)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0].object).to.exist()
          expect(res.body[0].permission).to.exist()
          expect(res.body[0].kind).to.exist()
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })
})
