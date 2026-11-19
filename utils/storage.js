/**
 * 本地存储封装：统一 key，统一 JSON 读写，避免各页面各写一套
 */
const KEYS = {
  CART: 'sg_cart',
  FAV: 'sg_favorites',
  ORDERS: 'sg_orders',
  USER: 'sg_user',
  ADDRESS: 'sg_address',
  SEARCH_HISTORY: 'sg_search_history',
  AI_HISTORY: 'sg_ai_history'
}

function get(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
  } catch (e) {
    return fallback
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
  } catch (e) {
    // ignore
  }
}

module.exports = { KEYS, get, set, remove }
