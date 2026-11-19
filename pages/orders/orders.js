const order = require('../../utils/order')

Page({
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'paid', label: '已付款' },
      { key: 'done', label: '已完成' }
    ],
    current: 'all',
    list: []
  },

  onLoad(options) {
    if (options && options.status) {
      this.setData({ current: options.status })
    }
  },

  onShow() {
    this.load()
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ current: key })
    this.load()
  },

  load() {
    this.setData({ list: order.list(this.data.current) })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goShopping() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
