const db = require('../../utils/db')
const config = require('../../utils/config')

Page({
  data: {
    banners: ['/images/banner1.jpg', '/images/banner2.jpg', '/images/banner3.jpg'],
    notice: config.store.notice,
    categories: [],
    guess: [],
    recommend: []
  },

  onLoad() {
    this.setData({
      categories: db.categoryList().slice(0, 8),
      guess: db.guess(6),
      recommend: db.recommend(4)
    })
  },

  onPullDownRefresh() {
    this.setData({ guess: db.guess(6) })
    wx.stopPullDownRefresh()
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  /** 分类是 tabBar 页面，用 globalData 传递选中的分类 */
  goCategory(e) {
    const id = e.currentTarget.dataset.id
    getApp().globalData.pendingCategory = id
    wx.switchTab({ url: '/pages/category/category' })
  },

  goMore() {
    wx.switchTab({ url: '/pages/category/category' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.detail.id })
  },

  goAI() {
    wx.navigateTo({ url: '/pages/ai/ai' })
  },

  onShareAppMessage() {
    return {
      title: '拾光书店 · 把喜欢的书放在手边',
      path: '/pages/index/index'
    }
  }
})
