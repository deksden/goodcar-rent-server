import { ServerError, ServerGenericError, ServerNotFound } from '../config/errors'

export const genericList = (Model) => (req, res) =>
  Model.findAll()
    .then((foundData) => res.json(foundData))
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericCreate = (Model) => (req, res) =>
  Model.create(req.matchedData)
    .then((item) => res.json(item))
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericItem = (Model) => (req, res) =>
  Model.findOne(req.params.id)
    .then((foundData) => {
      if (!foundData) {
        throw ServerNotFound(Model.name, req.params.id, `${Model.name} with id ${req.params.id} not found`)
      }
      res.json(foundData)
    })
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericSave = (Model) => (req, res) =>
  Model.update(req.matchedData)
    .then((foundData) => {
      return res.json(foundData)
    })
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericDelete = (Model) => (req, res) =>
  Model.delete(req.params.id)
    .then((foundData) => {
      if (foundData) {
        return res.sendStatus(204)
      }
      throw new ServerNotFound('Invite', req.params.id, 'Invite not found by id for delete')
    })