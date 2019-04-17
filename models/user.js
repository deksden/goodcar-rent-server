import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'
import {
  genericInit,
  genericFindById,
  genericFindOne,
  genericFindAll,
  genericCount,
  genericDelete,
  genericClearData,
  genericCreate,
  genericUpdate,
  genericDeleteAll
} from '../model-storage-knex/generic-knex'

/* User:
  * id: user identifier, UUID
  * name:
  * email: email, that user choose for registering
  * password: hashed password
  * invitedBy: -> User.id: user that created invite
  * inviteDate: date of invite
  * inviteId -> Invite.id: link to invite
  * disabled: if user account is disabled
*/

const Model = {
  name: 'User',
  props: [
    {
      name: 'id',
      type: 'id',
      default: () => uuid()
    },
    {
      name: 'name',
      type: 'text',
      default: null
    },
    {
      name: 'email',
      type: 'email',
      default: null
    },
    {
      name: 'password',
      type: 'password',
      default: null,
      beforeSet: (item) => bcrypt.hashSync(item.password, bcrypt.genSaltSync())
    },
    {
      name: 'invitedBy',
      type: 'ref',
      default: null
    },
    {
      name: 'inviteDate',
      type: 'datetime',
      default: null
    },
    {
      name: 'inviteId',
      type: 'ref',
      default: null
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false
    }
  ]
}

export default module.exports = (app) => {
  Model.app = app
  return {
    initData: genericInit(Model),
    clearData: genericClearData(Model),
    findById: genericFindById(Model),
    findOne: genericFindOne(Model),
    findAll: genericFindAll(Model),
    count: genericCount(Model),
    delete: genericDelete(Model),
    deleteAll: genericDeleteAll(Model),
    create: genericCreate(Model),
    update: genericUpdate(Model),

    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword)
  }
}