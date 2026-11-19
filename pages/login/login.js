const user = require('../../utils/user')

Page({
  data: {
    avatarUrl: '/images/avatar.png',
    nickName: ''
  },

  onLoad() {
    const current = user.getUser()
    if (current) {
      this.setData({
        avatarUrl: current.avatarUrl || '/images/avatar.png',
        nickName: current.nickName || ''
      })
    }
  },

  onChooseAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl })
  },

  onNickName(e) {
    this.setData({ nickName: e.detail.value })
  },

  submit() {
    const nickName = (this.data.nickName || '').trim()
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    user.login({ nickName, avatarUrl: this.data.avatarUrl })
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  },

  skip() {
    wx.navigateBack()
  }
})
