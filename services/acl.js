/*
ACL(object, permission):

Get all permissions for object's groups
Get all permissions for object itself

Get all user's groups

Set DENY permission

Check if any group permission is ok for this object: for groups/user

Check if any group have DENY permission: groups/user

Check if any object permission is allow: groups/user

Check if any object permission is DENY: groups/user

*/

import _ from 'lodash'
import { ServerNotAllowed } from '../config/errors'

export const kindAllow = 'ALLOW'

export const kindDeny = 'DENY'

export const GuestUserId = -1

/*
ACL.Object:

 * id: identifier for object, like "Invoce"
 * permissions: [] array of permissions:
   * permission: permission name, like "read", "write"
   * kind of permission, one of ALLOW/DENY
   * users: list of users that have this permission of this kind
   * userGroups: list of groups that have this permission of this kind
*/

const aclObject = []

export const CheckPermission = (userId, object, permission) => {
  // check if we have permission for user:
  const aObject = _.find(aclObject, { id: object })
  if (!aObject) {
    return kindDeny // no object defined, DENY
  }

  // find specified permission for object:
  const aPermission = _.find(aObject.permissions, { permission })
  if (!aPermission) {
    return kindDeny // no permission decalration, DENY
  }

  // check if specified object have exact user permission:
  const aUser = _.find(aPermission.users, { userId })
  if (!aUser) {
    return kindDeny
  }
  return aUser.kind
}

const FindOrAddObject = (objectId) => {
  let aObject = _.find(aclObject, { id: objectId })
  if (!aObject) {
    aObject = { id: objectId, permissions: [] }
    aclObject.push(aObject)
  }
  return aObject
}

const FindOrAddPermission = (aObject, permission) => {
  let aPermission = _.find(aObject.permissions, { permission })
  if (!aPermission) {
    aPermission = { permission, users: [], userGroups: [] }
    aObject.permissions.push(aPermission)
  }
  return aPermission
}

export default module.exports = (app) => {
  const { UserGroup } = app.models
  return {
    ACL: (object, permission) => {
      return (req, res, next) => {
        const auth = app.auth.passport.authenticate('jwt', { session: false })
        auth(req, res, () => {
          if (req.user) {
            // user already authenticated:
            if (UserGroup.isUserInGroupSync(UserGroup.systemGroupAdmin(), req.user.id)) {
              next() // user is in system admin group
            } else if (CheckPermission(req.user.id, object, permission) === kindAllow) {
              next() // user have allow kind of permission for this object/permission
            } else {
              next(new ServerNotAllowed(`Permission deny for user on ${object}.${permission}`))
            }
          } else {
            // user not authenticated, check permission for guest user:
            if (CheckPermission(GuestUserId, object, permission) === kindAllow) {
              next()
            } else {
              next(new ServerNotAllowed(`Permission deny for guest user on ${object}.${permission}`))
            }
          }
        })
      }
    },
    AddUserPermission: (userId, objectId, permission, kind) => {
      const aKind = kind || kindAllow

      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aUser = _.find(aPermission.users, { userId })
      if (!aUser) {
        aPermission.users.push({ userId, kind: aKind })
      } else {
        aUser.kind = aKind
      }
    },
    AddGroupPermission: (groupId, objectId, permission, kind) => {
      const aKind = kind || kindAllow
      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aGroup = _.find(aPermission.userGroups, { groupId })
      if (!aGroup) {
        aPermission.userGroups.push({ groupId, kind: aKind })
      } else {
        aGroup.kind = aKind
      }
    },
    ListACL: () => {
      return aclObject.map(item => item.id)
    }
  }
}