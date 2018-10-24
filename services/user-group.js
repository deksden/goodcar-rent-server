import _ from 'lodash'
import uuid from 'uuid/v4'

import dataUserGroupSystem from '../data/user-group-system'
import dataUserGroup from '../data/user-group'
import {
  genericClearData,
  genericCount,
  genericDelete,
  genericFindAll,
  genericFindById,
  genericFindOne,
  genericUpdate
} from './generic-model'

const _userGroup = []

/*

## UserGroup:

  id
  name
  systemType: null, Admin, Guest, LoggedIn
  users: [User]

## System types:

* Null: all members are defined by users, not system
* Admin: system type for admin user (first user in system at least) - manually can be added other user accounts
* Guest: not authenticated user
* LoggedIn: Authenticated users (any - admin, other users)

*/

export const systemTypeNone = null

export const systemTypeAdmin = 'Admin'
export const systemTypeGuest = 'Guest'
export const systemTypeLoggedIn = 'LoggedIn'

export default (app) => {
  let _systemGroupAdmin = null
  let _systemGroupGuest = null
  let _systemGroupLoggedIn = null

  const Model = {
    systemGroupAdmin: () => _systemGroupAdmin,
    systemGroupGuest: () => _systemGroupGuest,
    systemGroupLoggedIn: () => _systemGroupLoggedIn,
    findById: genericFindById(_userGroup),
    findOne: genericFindOne(_userGroup),
    findAll: genericFindAll(_userGroup),
    delete: genericDelete(_userGroup),
    count: genericCount(_userGroup),
    ClearData: genericClearData(_userGroup),
    update: genericUpdate(_userGroup),
    findGroupsForUser: (user) => Promise.resolve(_.filter(_userGroup, (item) => (_.includes(item.users, user) !== -1))),
    isUserInGroup: (groupId, userId) => {
      const aGroup = _.find(_userGroup, { id: groupId })
      if (!aGroup) {
        return Promise.reject(new Error(`Group ${groupId} can not be found`))
      }
      return Promise.resolve(_.includes(aGroup.users, userId))
    },
    isUserInGroupSync: (groupId, userId) => {
      const aGroup = _.find(_userGroup, { id: groupId })
      if (!aGroup) {
        return false
      }
      return _.includes(aGroup.users, userId)
    },
    create: (item) => {
      if (!item.id) {
        item.id = uuid()
      }
      if (!item.systemType) {
        item.systemType = systemTypeNone
      }
      if (!item.users) {
        item.users = []
      }
      _userGroup.push(item)
      return Promise.resolve(item)
    },
    addUser: (groupId, userId) => {
      const group = _.find(_userGroup, { id: groupId })
      if (!group) {
        return Promise.reject(group)
      }
      group.users = _.union(group.users, [userId])
      return Promise.resolve(group)
    },
    removeUser: (groupId, userId) => {
      const group = _.find(_userGroup, { id: groupId })
      if (!group) {
        return Promise.reject(group)
      }
      _.pull(group.users, [userId])
      return Promise.resolve(group)
    },
    createSystemData: () => {
      return Model.ClearData()
        .then(() => {
          _systemGroupAdmin = null
          _systemGroupGuest = null
          _systemGroupLoggedIn = null
          const arr = dataUserGroupSystem.map((item) => {
            Model.create(item)
              .then((newItem) => {
                if (!newItem) throw Error('Fail to create new UserGroup')

                if (newItem.systemType && newItem.systemType === systemTypeAdmin) {
                  if (_systemGroupAdmin) throw new Error('SystemData have duplicate Admin group')
                  _systemGroupAdmin = newItem.id
                } else if (newItem.systemType && newItem.systemType === systemTypeGuest) {
                  if (_systemGroupGuest) throw new Error('SystemData have duplicate Guest group')
                  _systemGroupGuest = newItem.id
                } else if (newItem.systemType && newItem.systemType === systemTypeLoggedIn) {
                  if (_systemGroupLoggedIn) throw new Error('SystemData have duplicate LoggedIn group')
                  _systemGroupLoggedIn = newItem.id
                }
              })
          })
          return Promise.all(arr)
        })
    },
    createData: () => Promise.all(dataUserGroup.map((item) => Model.create(item)))
  }
  return Model
}