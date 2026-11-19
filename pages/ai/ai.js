const ai = require('../../utils/ai')
const db = require('../../utils/db')
const config = require('../../utils/config')

const CHIPS = [
  '想找本轻松点的书',
  '学前端该看什么',
  '最近书荒了随便推',
  '适合睡前读的',
  '想读点经典的'
]

Page({
  data: {
    chips: CHIPS,
    messages: [],
    input: '',
    mode: '',
    modeText: '',
    sending: false,
    scrollTop: 0,
    storeName: config.store.name
  },

  onLoad() {
    this.msgSeq = 1
    this.tick = 0
    this.setData({
      messages: [
        {
          id: this.nextId('m'),
          role: 'ai',
          text: '我是拾光书店的 AI 推荐官。说说你最近想看什么——剧情、科幻、职场，或者只是想睡前放松，我都能从店里挑几本给你。',
          books: [],
          streaming: false
        }
      ]
    })
    this.refreshMode()
  },

  onUnload() {
    if (this.task && this.task.abort) this.task.abort()
  },

  nextId(prefix) {
    return (prefix || '') + this.msgSeq++
  },

  refreshMode() {
    const mode = ai.resolveMode()
    this.setData({ mode, modeText: ai.MODE_TEXT[mode] || '' })
  },

  onInput(e) {
    this.setData({ input: e.detail.value })
  },

  tapChip(e) {
    this.send(e.currentTarget.dataset.kw)
  },

  onSend() {
    this.send(this.data.input)
  },

  onClear() {
    if (this.task && this.task.abort) this.task.abort()
    this.setData({
      messages: [
        {
          id: this.nextId('m'),
          role: 'ai',
          text: '对话已清空，重新说说你想读什么吧。',
          books: [],
          streaming: false
        }
      ],
      sending: false,
      input: ''
    })
  },

  send(raw) {
    const question = String(raw || '').trim()
    if (!question) {
      wx.showToast({ title: '先说一句想看什么', icon: 'none' })
      return
    }
    if (this.data.sending) return

    // 先把历史取出来（不含本轮提问），避免把同一个问题发给模型两次
    const history = this.buildHistory()

    const userMsg = { id: this.nextId('m'), role: 'user', text: question, books: [], streaming: false }
    const aiMsg = { id: this.nextId('m'), role: 'ai', text: '', books: [], streaming: true, error: false }

    const messages = this.data.messages.concat([userMsg, aiMsg])
    this.setData({ messages, input: '', sending: true })
    this.scrollToBottom()

    let buffer = ''
    let lastFlush = 0

    const patch = (data) => this.patchMessage(aiMsg.id, data)

    const flush = (force) => {
      const now = Date.now()
      if (!force && now - lastFlush < 60) return
      lastFlush = now
      patch({ text: this.stripBooks(buffer) })
      this.scrollToBottom()
    }

    const finish = (payload) => {
      const ids = this.parseBooks(buffer)
      const books = ids.length ? db.booksByIds(ids).map((b) => ({ id: b.id, title: b.title, cover: b.cover, price: b.price })) : []
      patch({ text: this.stripBooks(buffer), streaming: false, books })
      this.setData({
        sending: false,
        mode: (payload && payload.mode) || this.data.mode,
        modeText: ai.MODE_TEXT[(payload && payload.mode) || this.data.mode] || this.data.modeText
      })
      this.scrollToBottom()
    }

    this.refreshMode()

    this.task = ai.ask({
      question,
      history,
      onMode: (mode) => {
        this.setData({ mode, modeText: ai.MODE_TEXT[mode] || '' })
      },
      onDelta: (text) => {
        buffer += text
        flush(false)
      },
      onReset: () => {
        buffer = ''
        patch({ text: '' })
      },
      onDone: (payload) => finish(payload),
      onError: () => {
        wx.showToast({ title: '模型不可用，已用离线推荐', icon: 'none' })
      }
    })
  },

  /** 只把最近几轮对话带给模型，控制 token */
  buildHistory() {
    const list = this.data.messages.filter((m) => !m.streaming && m.text)
    const recent = list.slice(-(config.ai.maxHistory || 6))
    return recent.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text
    }))
  },

  /** 去掉给机器看的 [BOOKS:...] 标记 */
  stripBooks(text) {
    return String(text || '').replace(/\[BOOKS:[^\]]*\]?/g, '').trim()
  },

  /** 解析推荐书目 id */
  parseBooks(text) {
    const match = String(text || '').match(/\[BOOKS:([\d,\s]+)\]/)
    if (!match) return []
    return match[1]
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !!db.bookById(v))
      .slice(0, 3)
  },

  patchMessage(id, data) {
    const index = this.data.messages.findIndex((m) => m.id === id)
    if (index < 0) return
    const patch = {}
    Object.keys(data).forEach((key) => {
      patch['messages[' + index + '].' + key] = data[key]
    })
    this.setData(patch)
  },

  scrollToBottom() {
    this.tick += 1
    this.setData({ scrollTop: 100000 + this.tick })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  copyLast() {
    const list = this.data.messages.filter((m) => m.role === 'ai' && m.text)
    const last = list[list.length - 1]
    if (!last) return
    wx.setClipboardData({ data: last.text })
  }
})
