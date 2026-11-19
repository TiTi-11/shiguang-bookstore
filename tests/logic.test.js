/**
 * 业务逻辑冒烟测试（Node 环境，模拟小程序 wx API）
 * 运行：node tests/logic.test.js
 */
const path = require('path')

/* ---------------- 模拟小程序环境 ---------------- */
const store = {}
global.wx = {
  getStorageSync: (k) => (k in store ? store[k] : ''),
  setStorageSync: (k, v) => { store[k] = v },
  removeStorageSync: (k) => { delete store[k] },
  showToast: () => {},
  setTabBarBadge: () => {},
  removeTabBarBadge: () => {},
  request: (opt) => {
    // 模拟模型接口不可达，用于验证「自动降级到离线推荐」
    setTimeout(() => opt.fail && opt.fail(new Error('mock network down')), 10)
    return { abort() {}, onChunkReceived() {} }
  }
}

const UTILS = path.join(__dirname, '..', 'utils')
const db = require(path.join(UTILS, 'db.js'))
const cart = require(path.join(UTILS, 'cart.js'))
const fav = require(path.join(UTILS, 'fav.js'))
const order = require(path.join(UTILS, 'order.js'))
const user = require(path.join(UTILS, 'user.js'))
const ai = require(path.join(UTILS, 'ai.js'))
const config = require(path.join(UTILS, 'config.js'))

let pass = 0
let fail = 0

function check(name, cond, extra) {
  if (cond) {
    pass++
    console.log('  ok   ' + name)
  } else {
    fail++
    console.log('  FAIL ' + name + (extra ? '  -> ' + extra : ''))
  }
}

/* ---------------- 数据层 ---------------- */
console.log('\n[数据层]')
const cats = db.categoryList()
check('分类数量为 12 且有图书统计', cats.length === 12 && cats[0].count > 0)
check('图书总数为 32', db.list({}).total === 32, String(db.list({}).total))
check('书名/作者搜索命中', db.list({ keyword: '东野' }).total === 2)
check('标签搜索命中', db.list({ keyword: '科幻' }).total >= 2)
const sorted = db.list({ cid: 'jsjx', sort: 'priceAsc' }).list
check('价格升序排序正确', sorted[0].price <= sorted[sorted.length - 1].price)
check('封面路径拼接正确', db.bookById(1).cover === '/images/covers/c01.jpg')
check('AI 书目清单覆盖全部图书', db.catalogForAI().split('\n').length === 32)

/* ---------------- 购物车 ---------------- */
console.log('\n[购物车]')
cart.clear()
cart.add(4, 2)
cart.add(4, 1)
cart.add(29, 1)
let summary = cart.summary()
check('重复加购合并数量', summary.items.find((i) => i.id === 4).num === 3)
check('件数统计正确', summary.selectedCount === 4)
check('金额计算正确', summary.total === 191) // 52*3 + 35
check('满 99 免运费', summary.freight === 0)
cart.toggle(29)
summary = cart.summary()
check('取消勾选后金额减少', summary.total === 156)
check('全选状态跟随变化', summary.allChecked === false)
cart.clear()
check('清空购物车', cart.count() === 0)

/* ---------------- 收藏 ---------------- */
console.log('\n[收藏]')
check('收藏成功', fav.toggle(5) === true && fav.has(5))
check('收藏列表包含该书', fav.list().length === 1)
check('取消收藏', fav.toggle(5) === false && fav.has(5) === false)

/* ---------------- 用户与订单 ---------------- */
console.log('\n[用户与订单]')
const u = user.login({ nickName: '测试读者' })
check('本地登录生成 token', !!u.token && user.isLogin())
cart.add(1, 1)
cart.add(2, 2)
const s2 = cart.summary()
const created = order.create({
  items: s2.selected,
  total: s2.total,
  freight: s2.freight,
  payable: s2.payable,
  address: { name: '测试', phone: '13800138000', detail: '江西省南昌市某街道 1 号' }
})
check('订单号格式正确', /^SG\d{14}\d{4}$/.test(created.orderNo), created.orderNo)
check('订单写入并可查询', order.findByNo(created.orderNo).orderNo === created.orderNo)
user.logout()
check('退出登录清空状态', user.isLogin() === false)

/* ---------------- AI 降级链路 ---------------- */
console.log('\n[AI 推荐：模型不可达 → 自动降级离线]')
config.ai.mode = 'local' // 强制走模型通道，验证失败后自动降级

let text = ''
let books = []
const task = ai.ask({
  question: '我想看科幻类的',
  history: [],
  onMode: () => {},
  onDelta: (t) => { text += t },
  onReset: () => { text = '' },
  onDone: (payload) => {
    const m = text.match(/\[BOOKS:([\d,]+)\]/)
    books = m ? m[1].split(',').map(Number) : []
    check('可 abort 的任务句柄', !!task && typeof task.abort === 'function')
    check('降级为离线模式', payload.mode === 'rule', payload.mode)
    check('输出了推荐文案', text.length > 40)
    check('返回 3 个书目 id', books.length === 3, JSON.stringify(books))
    check('书目 id 均有效', books.every((id) => !!db.bookById(id)))
    check('首本命中科幻分类', db.bookById(books[0]).cid === 'khkj')
    check('文案包含推荐理由', text.includes('——'))

    console.log(`\n结果：${pass} 通过, ${fail} 失败`)
    process.exit(fail ? 1 : 0)
  },
  onError: () => {}
})
