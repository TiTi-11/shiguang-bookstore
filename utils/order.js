/**
 * 订单服务：本地模拟下单，结构按真实接口设计
 */
const storage = require('./storage')
const util = require('./util')

const KEY = storage.KEYS.ORDERS

const STATUS = {
  unpaid: '待付款',
  paid: '已付款',
  shipped: '已发货',
  done: '已完成',
  closed: '已取消'
}

function all() {
  return storage.get(KEY, [])
}

/** 创建订单 */
function create(payload) {
  const { items, total, freight, payable, address } = payload
  const order = {
    orderNo: util.orderNo(),
    status: 'paid',
    statusText: STATUS.paid,
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      cover: i.cover,
      price: i.price,
      num: i.num,
      subtotal: i.subtotal
    })),
    total,
    freight,
    payable,
    address,
    createdAt: Date.now(),
    createdAtText: util.time(Date.now())
  }
  storage.set(KEY, [order].concat(all()))
  return order
}

/** 列表，可按状态过滤 */
function list(status) {
  const orders = all()
  if (!status || status === 'all') return orders
  return orders.filter((o) => o.status === status)
}

function findByNo(orderNo) {
  return all().find((o) => o.orderNo === orderNo) || null
}

function count(status) {
  return list(status).length
}

module.exports = { create, list, findByNo, count, STATUS }
