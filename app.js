const cart = require('./utils/cart')

App({
  globalData: {
    brand: '拾光书店'
  },

  onLaunch() {
    this.refreshCartBadge()
  },

  onShow() {
    this.refreshCartBadge()
  },

  /** 购物车角标：数量为 0 时移除角标 */
  refreshCartBadge() {
    const count = cart.count()
    try {
      if (count > 0) {
        wx.setTabBarBadge({ index: 2, text: String(count > 99 ? '99+' : count) })
      } else {
        wx.removeTabBarBadge({ index: 2 })
      }
    } catch (e) {
      // tabBar 尚未就绪时忽略
    }
  }
})
