const cart = require('../../utils/cart')

Page({
  data: {
    items: [],
    summary: { total: 0, payable: 0, freight: 0, allChecked: false, selectedCount: 0 }
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const summary = cart.summary()
    this.setData({ items: summary.items, summary })
    getApp().refreshCartBadge()
  },

  toggle(e) {
    cart.toggle(e.currentTarget.dataset.id)
    this.refresh()
  },

  toggleAll() {
    cart.toggleAll(!this.data.summary.allChecked)
    this.refresh()
  },

  minus(e) {
    const { id, num } = e.currentTarget.dataset
    if (num <= 1) return
    cart.setNum(id, num - 1)
    this.refresh()
  },

  plus(e) {
    const { id, num } = e.currentTarget.dataset
    if (num >= 99) {
      wx.showToast({ title: '单次最多 99 件', icon: 'none' })
      return
    }
    cart.setNum(id, num + 1)
    this.refresh()
  },

  remove(e) {
    const { id, title } = e.currentTarget.dataset
    wx.showModal({
      title: '移除图书',
      content: '确定把《' + title + '》移出购物车？',
      success: (res) => {
        if (res.confirm) {
          cart.remove(id)
          this.refresh()
        }
      }
    })
  },

  clear() {
    if (!this.data.items.length) return
    wx.showModal({
      title: '清空购物车',
      content: '确定清空全部图书？',
      success: (res) => {
        if (res.confirm) {
          cart.clear()
          this.refresh()
        }
      }
    })
  },

  checkout() {
    if (!this.data.summary.selectedCount) {
      wx.showToast({ title: '请先选择图书', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/checkout/checkout?from=cart' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goShopping() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
