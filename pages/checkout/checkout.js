const db = require('../../utils/db')
const cart = require('../../utils/cart')
const order = require('../../utils/order')
const user = require('../../utils/user')
const storage = require('../../utils/storage')
const util = require('../../utils/util')

Page({
  data: {
    items: [],
    total: 0,
    freight: 0,
    payable: 0,
    from: 'cart',
    address: { name: '', phone: '', detail: '' },
    remark: '',
    submitting: false
  },

  onLoad(options) {
    const from = options.from === 'buy' ? 'buy' : 'cart'
    let items = []
    let buyId = null

    if (from === 'buy') {
      const book = db.bookById(options.id)
      if (!book) {
        wx.showToast({ title: '图书不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 600)
        return
      }
      buyId = book.id
      items = [{ ...book, num: 1, subtotal: Number(book.price) }]
    } else {
      items = cart.summary().selected
      if (!items.length) {
        wx.showToast({ title: '没有可结算的图书', icon: 'none' })
        setTimeout(() => wx.switchTab({ url: '/pages/cart/cart' }), 600)
        return
      }
    }

    const total = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2))
    const freight = util.freight(total)
    const saved = storage.get(storage.KEYS.ADDRESS, null)
    const nickName = user.getUser() ? user.getUser().nickName : ''

    this.setData({
      items,
      buyId,
      from,
      total,
      freight,
      payable: Number((total + freight).toFixed(2)),
      address: saved || { name: nickName, phone: '', detail: '' }
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ ['address.' + field]: e.detail.value })
  },

  onRemark(e) {
    this.setData({ remark: e.detail.value })
  },

  submit() {
    if (this.data.submitting) return
    const { address, items, total, freight, payable, from, buyId } = this.data

    if (!address.name.trim()) {
      wx.showToast({ title: '请填写收货人', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(address.phone.trim())) {
      wx.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return
    }
    if (address.detail.trim().length < 5) {
      wx.showToast({ title: '详细地址太短了', icon: 'none' })
      return
    }

    storage.set(storage.KEYS.ADDRESS, address)
    this.setData({ submitting: true })
    wx.showLoading({ title: '正在下单', mask: true })

    // 模拟请求耗时
    setTimeout(() => {
      const created = order.create({
        items,
        total,
        freight,
        payable,
        address
      })

      if (from === 'cart') {
        items.forEach((i) => cart.remove(i.id))
      }
      getApp().refreshCartBadge()

      wx.hideLoading()
      this.setData({ submitting: false })
      wx.redirectTo({ url: '/pages/result/result?orderNo=' + created.orderNo })
    }, 700)
  }
})
