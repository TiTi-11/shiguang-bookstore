const order = require('../../utils/order')

Page({
  data: {
    order: null
  },

  onLoad(options) {
    const found = order.findByNo(options.orderNo)
    this.setData({ order: found })
    if (found) {
      wx.setNavigationBarTitle({ title: '支付成功' })
    }
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  }
})
