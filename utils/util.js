/**
 * 通用工具函数
 */
const util = {
  /** 价格格式化：50 -> 50.00 */
  price(value) {
    const n = Number(value) || 0
    return n.toFixed(2)
  },

  /** 包邮后应付运费 */
  freight(total) {
    const { fee, freeAt } = require('./config').freight
    return Number(total) >= freeAt ? 0 : fee
  },

  /** 销量友好展示：12800 -> 1.2万 */
  sales(value) {
    const n = Number(value) || 0
    if (n < 10000) return String(n)
    return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  },

  /** 时间戳 -> 2026-11-19 14:05 */
  time(ts) {
    const d = new Date(ts || Date.now())
    const pad = (v) => (v < 10 ? '0' + v : '' + v)
    return (
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
    )
  },

  /** 生成订单号：SG + 年月日时分秒 + 4 位随机 */
  orderNo() {
    const d = new Date()
    const pad = (v) => (v < 10 ? '0' + v : '' + v)
    const stamp =
      d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
    const rand = Math.floor(Math.random() * 9000 + 1000)
    return 'SG' + stamp + rand
  },

  /** 简易防抖，用于输入框搜索 */
  debounce(fn, delay = 300) {
    let timer = null
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  },

  /** 截断长文本 */
  ellipsis(text, max) {
    const s = String(text || '')
    return s.length > max ? s.slice(0, max) + '…' : s
  }
}

module.exports = util
