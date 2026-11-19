/**
 * 收藏服务
 */
const storage = require('./storage')
const db = require('./db')

const KEY = storage.KEYS.FAV

function ids() {
  return storage.get(KEY, [])
}

function list() {
  return db.booksByIds(ids())
}

function has(id) {
  return ids().includes(Number(id))
}

function toggle(id) {
  const target = Number(id)
  const current = ids()
  const next = current.includes(target)
    ? current.filter((i) => i !== target)
    : current.concat(target)
  storage.set(KEY, next)
  return next.includes(target)
}

function remove(id) {
  storage.set(KEY, ids().filter((i) => i !== Number(id)))
}

function count() {
  return ids().length
}

module.exports = { list, has, toggle, remove, count }
