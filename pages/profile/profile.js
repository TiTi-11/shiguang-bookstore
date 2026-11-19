const user = require('../../utils/user')
const order = require('../../utils/order')
const fav = require('../../utils/fav')
const cart = require('../../utils/cart')
const config = require('../../utils/config')

Page({
  data: {
    user: null,
    cartCount: 0,
    favCount: 0,
    orderCount: 0,
    store: config.store
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    this.setData({
      user: user.getUser(),
      cartCount: cart.count(),
      favCount: fav.count(),
      orderCount: order.count('all')
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  goOrders(e) {
    const status = e.currentTarget.dataset.status || 'all'
    wx.navigateTo({ url: '/pages/orders/orders?status=' + status })
  },

  goFavorites() {
    wx.navigateTo({ url: '/pages/favorites/favorites' })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  goAI() {
    wx.navigateTo({ url: '/pages/ai/ai' })
  },

  callStore() {
    wx.makePhoneCall({ phoneNumber: config.store.phone }).catch(() => {})
  },

  about() {
    wx.showModal({
      title: '关于拾光书店',
      content: '微信原生小程序示例项目：商品浏览、搜索、购物车、下单、收藏与 AI 图书推荐。\n数据为本地示例数据。',
      showCancel: false
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前账号？',
      success: (res) => {
        if (res.confirm) {
          user.logout()
          this.refresh()
        }
      }
    })
  }
})
