/**
 * 数据查询层
 * 页面不直接引用 mock.js，统一走这里，将来换成真实接口只改这一层。
 */
const { books, categories } = require('./mock')

const SORTS = {
  default: (a, b) => b.sales - a.sales,
  sales: (a, b) => b.sales - a.sales,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating
}

/** 分类 + 每类图书数量 */
function categoryList() {
  return categories.map((c) => ({
    ...c,
    count: books.filter((b) => b.cid === c.id).length
  }))
}

function categoryById(id) {
  return categories.find((c) => c.id === id) || null
}

function bookById(id) {
  return books.find((b) => b.id === Number(id)) || null
}

function booksByIds(ids) {
  return (ids || []).map((id) => bookById(id)).filter(Boolean)
}

/**
 * 列表查询
 * @param {object} opt { cid, keyword, sort, page, pageSize }
 */
function list(opt = {}) {
  const { cid, keyword, sort = 'default', page = 1, pageSize = 999 } = opt
  let result = books.slice()

  if (cid) result = result.filter((b) => b.cid === cid)

  if (keyword) {
    const kw = String(keyword).trim().toLowerCase()
    result = result.filter((b) =>
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(kw))
    )
  }

  result.sort(SORTS[sort] || SORTS.default)

  const total = result.length
  const start = (page - 1) * pageSize
  return {
    total,
    list: result.slice(start, start + pageSize)
  }
}

/** 猜你喜欢：随机 6 本 */
function guess(size = 6) {
  const pool = books.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, size)
}

/** 推荐好书：高分 + 高销量 */
function recommend(size = 4) {
  return books
    .slice()
    .sort((a, b) => b.rating * 1000 + b.sales / 100 - (a.rating * 1000 + a.sales / 100))
    .slice(0, size)
}

/** 搜索页热搜词 */
function hotWords() {
  return ['三体', '东野圭吾', '前端', '余华', '科幻', '经典名著']
}

/** 组装给大模型看的书目清单（只给必要字段，控制 token） */
function catalogForAI() {
  return books
    .map((b) => `${b.id}.《${b.title}》${b.author}｜${categoryById(b.cid).name}｜¥${b.price}`)
    .join('\n')
}

module.exports = {
  categoryList,
  categoryById,
  bookById,
  booksByIds,
  list,
  guess,
  recommend,
  hotWords,
  catalogForAI,
  all: () => books
}
