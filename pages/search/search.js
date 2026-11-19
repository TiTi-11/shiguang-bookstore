const db = require('../../utils/db')
const storage = require('../../utils/storage')
const util = require('../../utils/util')

Page({
  data: {
    keyword: '',
    history: [],
    hot: [],
    results: [],
    count: 0,
    searched: false
  },

  onLoad() {
    this.setData({
      history: storage.get(storage.KEYS.SEARCH_HISTORY, []),
      hot: db.hotWords()
    })
    this.searchLater = util.debounce((kw) => this.doSearch(kw), 250)
  },

  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    if (!keyword.trim()) {
      this.setData({ results: [], searched: false, count: 0 })
      return
    }
    this.searchLater(keyword)
  },

  onConfirm() {
    this.doSearch(this.data.keyword, true)
  },

  tapKeyword(e) {
    const kw = e.currentTarget.dataset.kw
    this.setData({ keyword: kw })
    this.doSearch(kw, true)
  },

  doSearch(raw, save) {
    const keyword = String(raw || '').trim()
    if (!keyword) return
    const result = db.list({ keyword })
    this.setData({
      results: result.list,
      count: result.total,
      searched: true
    })
    if (save) this.saveHistory(keyword)
  },

  saveHistory(keyword) {
    const history = [keyword]
      .concat(this.data.history.filter((i) => i !== keyword))
      .slice(0, 8)
    storage.set(storage.KEYS.SEARCH_HISTORY, history)
    this.setData({ history })
  },

  clearHistory() {
    storage.remove(storage.KEYS.SEARCH_HISTORY)
    this.setData({ history: [] })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.detail.id })
  }
})
