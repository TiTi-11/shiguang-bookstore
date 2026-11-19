const fav = require('../../utils/fav')
const cart = require('../../utils/cart')

Page({
  data: {
    list: []
  },

  onShow() {
    this.setData({ list: fav.list() })
  },

  remove(e) {
    const { id, title } = e.currentTarget.dataset
    wx.showModal({
      title: '取消收藏',
      content: '不再收藏《' + title + '》？',
      success: (res) => {
        if (res.confirm) {
          fav.remove(id)
          this.setData({ list: fav.list() })
        }
      }
    })
  },

  addCart(e) {
    const id = e.currentTarget.dataset.id
    cart.add(id, 1)
    getApp().refreshCartBadge()
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goShopping() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
