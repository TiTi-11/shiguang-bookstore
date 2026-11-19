/**
 * 用户服务：本地模拟登录态（真实项目替换为 wx.login + 后端换 openid）
 */
const storage = require('./storage')

const KEY = storage.KEYS.USER

function getUser() {
  return storage.get(KEY, null)
}

function isLogin() {
  return !!getUser()
}

/** 保存用户信息并生成一个本地 token */
function login(profile = {}) {
  const user = {
    nickName: profile.nickName || '拾光读者',
    avatarUrl: profile.avatarUrl || '/images/avatar.png',
    token: 'local_' + Date.now(),
    loginAt: Date.now()
  }
  storage.set(KEY, user)
  return user
}

function logout() {
  storage.remove(KEY)
}

function update(patch) {
  const user = getUser()
  if (!user) return null
  const next = { ...user, ...patch }
  storage.set(KEY, next)
  return next
}

module.exports = { getUser, isLogin, login, logout, update }
