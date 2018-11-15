/* eslint-env mocha */
import { describe, it, beforeEach } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import {
  createAdminUser,
  loginAs,
  userGroupList,
  UserAdmin
} from '../client/client-api'
import env from 'dotenv-safe'

/*
  ## Test system user groups

*/

chai.use(dirtyChai)

// test case:
describe('(controller) user-group, system:', function () {
  env.config()
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const request = supertest(app)

  const context = {
    request,
    apiRoot: '',
    authSchema: 'Bearer'
  }

  beforeEach(function (done) {
    app.models.ClearData()
      .then(() => app.models.UserGroup.createSystemData())
      .then(() => app.models.UserGroup.createData())
      .then(() => createAdminUser(context))
      .then(() => loginAs(context, UserAdmin))
      .then(() => done())
  })

  describe('list:', function () {
    describe('should list groups:', function () {
      it('should display list of system groups if all is ok', function (done) {
        userGroupList(context)
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array')
            expect(res.body).to.have.lengthOf(5)
          })
          .then(() => done())
          .catch((err) => done(err))
      })
    })
  })
})
