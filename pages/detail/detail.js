const db = require('../../utils/db')
const cart = require('../../utils/cart')
const fav = require('../../utils/fav')
const util = require('../../utils/util')

Page({
  data: {
    book: null,
    isFav: false,
    cartCount: 0,
    related: []
  },

  onLoad(options) {
    const id = Number(options.id)
    const book = db.bookById(id)
    if (!book) {
      wx.showToast({ title: '图书不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    wx.setNavigationBarTitle({ title: book.title })

    const related = db
      .list({ cid: book.cid, sort: 'rating' })
      .list.filter((b) => b.id !== book.id)
      .slice(0, 3)

    this.setData({
      book: {
        ...book,
        priceText: util.price(book.price),
        originalText: util.price(book.originalPrice),
        salesText: util.sales(book.sales)
      },
      isFav: fav.has(id),
      related
    })
  },

  onShow() {
    this.setData({ cartCount: cart.count() })
  },

  addCart() {
    const { book } = this.data
    cart.add(book.id, 1)
    getApp().refreshCartBadge()
    this.setData({ cartCount: cart.count() })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  buyNow() {
    wx.navigateTo({ url: '/pages/checkout/checkout?from=buy&id=' + this.data.book.id })
  },

  toggleFav() {
    const { book } = this.data
    const on = fav.toggle(book.id)
    this.setData({ isFav: on })
    wx.showToast({ title: on ? '已收藏' : '已取消收藏', icon: 'none' })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.detail.id })
  },

  onShareAppMessage() {
    const { book } = this.data
    return {
      title: book ? '《' + book.title + '》· 拾光书店' : '拾光书店',
      path: '/pages/detail/detail?id=' + (book ? book.id : '')
    }
  }
})
