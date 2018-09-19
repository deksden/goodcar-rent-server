const adminPassword = 'admin12345'
const userPassword = 'user12345'

export const UserAdmin = {
  name: 'John Admin',
  email: 'admin@email.net',
  password: adminPassword,
  isAdmin: true
}

export const UserFirst = {
  name: 'First User',
  email: 'user1@email.net',
  password: `${userPassword}_1`,
  isAdmin: false
}

export const UserSecond = {
  name: 'Second User',
  email: 'user2@email.net',
  password: `${userPassword}_2`,
  isAdmin: false
}

export const expected = {
  Ok: 200,
  ErrCodeNotLogged: 401,
  ErrCodeForbidden: 403,
  ErrCodeNotFound: 404,
  ErrCodeInvalidParams: 412,
  ErrCodeError: 500,
  ErrCodeGeneric: 503,
}

export const createAdminUser = context => context.request.post(`${context.apiRoot}/auth/signup`)
  .send(UserAdmin)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expected.Ok)

export const createUser = (context, user, expectedCode) => context.request.post(`${context.apiRoot}/auth/signup`)
  .send(user || UserFirst)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)

export const loginAs = (context, user, expectedCode) => context.request.post(`${context.apiRoot}/auth/login`)
  .send({
    email: user.email,
    password: user.password,
  })
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)