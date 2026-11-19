/**
 * 购物车服务：storage 持久化，页面只调这里的方法
 * 存储结构：[{ id, num, checked }]
 */
const storage = require('./storage')
const db = require('./db')
const config = require('./config')

const KEY = storage.KEYS.CART

function raw() {
  return storage.get(KEY, [])
}

function save(items) {
  storage.set(KEY, items)
}

/** 购物车明细：把存储结构和图书信息合并 */
function list() {
  return raw()
    .map((it) => {
      const book = db.bookById(it.id)
      if (!book) return null
      return {
        ...book,
        num: it.num,
        checked: it.checked !== false,
        subtotal: Number((book.price * it.num).toFixed(2))
      }
    })
    .filter(Boolean)
}

/** 加入购物车（已存在则累加） */
function add(id, num = 1) {
  const items = raw()
  const target = items.find((i) => i.id === Number(id))
  if (target) {
    target.num += num
    target.checked = true
  } else {
    items.push({ id: Number(id), num, checked: true })
  }
  save(items)
  return count()
}

/** 设置数量，最少 1 件 */
function setNum(id, num) {
  const items = raw()
  const target = items.find((i) => i.id === Number(id))
  if (target) {
    target.num = Math.max(1, num)
    save(items)
  }
}

function remove(id) {
  save(raw().filter((i) => i.id !== Number(id)))
}

function toggle(id) {
  const items = raw()
  const target = items.find((i) => i.id === Number(id))
  if (target) {
    target.checked = !target.checked
    save(items)
  }
}

function toggleAll(checked) {
  save(raw().map((i) => ({ ...i, checked })))
}

function clear() {
  save([])
}

/** 商品总件数（tabBar 角标用） */
function count() {
  return raw().reduce((sum, i) => sum + i.num, 0)
}

/** 结算汇总 */
function summary() {
  const items = list()
  const selected = items.filter((i) => i.checked)
  const total = Number(selected.reduce((s, i) => s + i.subtotal, 0).toFixed(2))
  const freight = selected.length ? Number(total) >= config.freight.freeAt ? 0 : config.freight.fee : 0
  return {
    items,
    selected,
    selectedCount: selected.reduce((s, i) => s + i.num, 0),
    total,
    freight,
    payable: Number((total + freight).toFixed(2)),
    allChecked: items.length > 0 && items.every((i) => i.checked)
  }
}

module.exports = { list, add, setNum, remove, toggle, toggleAll, clear, count, summary }
