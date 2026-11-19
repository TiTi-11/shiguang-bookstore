const db = require('../../utils/db')

Page({
  data: {
    cats: [],
    currentId: '',
    currentName: '',
    sort: 'default',
    sorts: [
      { key: 'default', label: '综合' },
      { key: 'sales', label: '销量' },
      { key: 'priceAsc', label: '价格' },
      { key: 'rating', label: '评分' }
    ],
    books: [],
    total: 0
  },

  onLoad() {
    const cats = db.categoryList()
    this.setData({ cats, currentId: cats[0].id })
    this.load()
  },

  onShow() {
    const app = getApp()
    const pending = app.globalData.pendingCategory
    if (pending) {
      app.globalData.pendingCategory = ''
      this.setData({ currentId: pending, sort: 'default' })
      this.load()
    }
  },

  selectCat(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.currentId) return
    this.setData({ currentId: id })
    this.load()
  },

  changeSort(e) {
    const key = e.currentTarget.dataset.key
    if (key === this.data.sort) return
    this.setData({ sort: key })
    this.load()
  },

  load() {
    const { currentId, sort } = this.data
    const result = db.list({ cid: currentId, sort })
    const cat = db.categoryById(currentId)
    this.setData({
      books: result.list,
      total: result.total,
      currentName: cat ? cat.name : ''
    })
    wx.pageScrollTo && wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.detail.id })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
