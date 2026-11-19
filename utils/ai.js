/**
 * AI 图书推荐官
 * 三种通道：
 *   cloud —— 云端 OpenAI 兼容接口（DeepSeek 等），SSE 流式
 *   local —— 本地 Ollama（/api/chat），JSONL 流式
 *   rule  —— 离线规则推荐（无网络/无 Key 时的兜底，保证演示永远可用）
 *
 * 对外只暴露 ask()，页面不关心底层用的是哪个模型。
 */
const config = require('./config')
const db = require('./db')
const { createDecoder, createLineReader } = require('./stream')

const MODE_TEXT = {
  cloud: '云端模型',
  local: '本地模型',
  rule: '离线推荐'
}

/** 系统提示词：告诉模型它是谁、有哪些书、怎么输出 */
function systemPrompt() {
  return [
    '你是「拾光书店」的 AI 图书推荐官，服务对象是想买书但不知道读什么的读者。',
    '推荐时必须只从下面的书单里选，不要编造书名：',
    db.catalogForAI(),
    '输出要求：',
    '1. 先用一两句话接住读者的需求，语气自然，像店员聊天，不要用"尊敬的用户"这类腔调；',
    '2. 再用编号列出 2-3 本，每本一句推荐理由，理由要具体（讲它好读在哪、适合什么场景）；',
    '3. 结尾不要再重复书名清单；',
    '4. 最后单独一行输出 [BOOKS:图书id,图书id]，ids 用英文逗号分隔，最多 3 个，与上面推荐顺序一致。'
  ].join('\n')
}

/** 根据配置决定走哪条通道 */
function resolveMode() {
  const mode = config.ai.mode
  if (mode === 'cloud' || mode === 'local' || mode === 'rule') return mode
  if (config.ai.cloud.apiKey) return 'cloud'
  return 'local'
}

/**
 * 通用流式请求
 * @param {object} opt { url, header, data, parseLine, onDelta, onDone, onError, timeout }
 * @return {object} requestTask（可 abort）
 */
function streamRequest(opt) {
  const { url, header, data, parseLine, onDelta, onDone, onError, timeout } = opt
  const decode = createDecoder()
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    onDone && onDone()
  }

  const fail = (err) => {
    if (finished) return
    finished = true
    onError && onError(err)
  }

  const readLine = createLineReader((line) => {
    const piece = parseLine(line)
    if (piece === '__DONE__') {
      finish()
      return
    }
    if (piece) onDelta && onDelta(piece)
  })

  const task = wx.request({
    url,
    method: 'POST',
    header,
    data,
    timeout: timeout || config.ai.timeout,
    enableChunked: true,
    responseType: 'arraybuffer',
    success: () => finish(),
    fail: (err) => fail(err)
  })

  if (!task || typeof task.onChunkReceived !== 'function') {
    fail(new Error('当前基础库不支持流式响应，请把开发者工具基础库调到 2.20.1 以上'))
    return task
  }

  task.onChunkReceived((res) => {
    try {
      readLine(decode(res.data))
    } catch (e) {
      fail(e)
    }
  })

  return task
}

/* ------------------------------------------------------------------ 云端 */

function cloudStream(payload) {
  const { question, history, onDelta, onDone, onError } = payload
  const { baseUrl, apiKey, model } = config.ai.cloud
  const messages = [{ role: 'system', content: systemPrompt() }]
    .concat(history || [])
    .concat([{ role: 'user', content: question }])

  return streamRequest({
    url: baseUrl.replace(/\/$/, '') + '/chat/completions',
    header: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey
    },
    data: { model, messages, stream: true, temperature: 0.7 },
    parseLine(line) {
      const text = line.trim()
      if (!text || !text.startsWith('data:')) return null
      const payloadText = text.slice(5).trim()
      if (payloadText === '[DONE]') return '__DONE__'
      try {
        const json = JSON.parse(payloadText)
        return (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) || null
      } catch (e) {
        return null
      }
    },
    onDelta,
    onDone,
    onError
  })
}

/* ------------------------------------------------------------------ 本地 */

function localStream(payload) {
  const { question, history, onDelta, onDone, onError } = payload
  const { baseUrl, model } = config.ai.local
  const messages = [{ role: 'system', content: systemPrompt() }]
    .concat(history || [])
    .concat([{ role: 'user', content: question }])

  return streamRequest({
    url: baseUrl.replace(/\/$/, '') + '/api/chat',
    header: { 'Content-Type': 'application/json' },
    data: { model, messages, stream: true },
    parseLine(line) {
      const text = line.trim()
      if (!text) return null
      try {
        const json = JSON.parse(text)
        if (json.done) return '__DONE__'
        return (json.message && json.message.content) || null
      } catch (e) {
        return null
      }
    },
    onDelta,
    onDone,
    onError
  })
}

/* ------------------------------------------------------------------ 离线规则 */

const RULES = [
  { keys: ['科幻', '宇宙', '太空', '未来', '星际'], cid: 'khkj', say: '想看科幻的话，这三本不会踩雷。' },
  { keys: ['推理', '悬疑', '烧脑', '反转', '凶手'], cid: 'xytl', say: '烧脑向，我按"读到停不下来"排序。' },
  { keys: ['前端', '编程', '代码', 'javascript', 'js', '程序员', '开发', '计算机'], cid: 'jsjx', say: '技术书容易看不下去，这三本属于能真正啃完的。' },
  { keys: ['历史', '明朝', '古代', '王朝'], cid: 'lsjs', say: '历史书最怕枯燥，这几本都在讲故事。' },
  { keys: ['爱情', '言情', '民国', '暗恋'], cid: 'yyjj', say: '想读点细腻的感情，这几本刚好。' },
  { keys: ['青春', '校园', '高中', '学生'], cid: 'xyxd', say: '青春文学里比较耐读的几本。' },
  { keys: ['经典', '名著', '文学', '深刻'], cid: 'jqrm', say: '经典不一定难读，从这几本入门比较友好。' },
  { keys: ['孩子', '童话', '儿童', '小朋友', '小学'], cid: 'ercy', say: '给孩子的书，大人都能看得进去。' },
  { keys: ['心理', '社会', '思维', '认知', '焦虑'], cid: 'shkx', say: '想换个角度看世界的话，先看这几本。' },
  { keys: ['玄幻', '热血', '爽', '升级'], cid: 'xhqh', say: '想放松就选这几本，节奏快、代入感强。' },
  { keys: ['探险', '盗墓', '刺激', '紧张'], cid: 'dmty', say: '要刺激的话，这几本氛围拉满。' }
]

function pickByRule(question) {
  const q = String(question || '').toLowerCase()
  const rule = RULES.find((r) => r.keys.some((k) => q.includes(k)))
  const cid = rule ? rule.cid : null
  const list = cid ? db.list({ cid, sort: 'rating' }).list.slice(0, 3) : []
  if (list.length < 3) {
    db.recommend(8).forEach((b) => {
      if (list.length < 3 && !list.some((x) => x.id === b.id)) list.push(b)
    })
  }
  return { list, say: rule ? rule.say : '那我按口碑给你挑三本，尽量不踩雷。' }
}

function ruleStream(payload) {
  const { question, onDelta, onDone } = payload
  const { list, say } = pickByRule(question)
  const lines = list.map((b, i) => `${i + 1}.《${b.title}》——${b.intro.split('，')[0]}，${b.rating} 分。`)
  const full = [say].concat(lines).join('\n') + '\n[BOOKS:' + list.map((b) => b.id).join(',') + ']'

  let index = 0
  const timer = setInterval(() => {
    const step = Math.random() > 0.6 ? 2 : 1
    onDelta(full.slice(index, index + step))
    index += step
    if (index >= full.length) {
      clearInterval(timer)
      onDone && onDone()
    }
  }, 28)

  return {
    abort() {
      clearInterval(timer)
    }
  }
}

/* ------------------------------------------------------------------ 对外 */

/**
 * 提问
 * @param {object} opt
 *   question  用户问题
 *   history   历史消息（[{role, content}]）
 *   onDelta   增量文本回调
 *   onDone    ({ mode }) 结束回调
 *   onError   (err) 错误回调（会自动降级到 rule）
 *   onMode    (mode) 通道确定时回调，用于界面提示
 */
function ask(opt) {
  const { question, history = [], onDelta, onDone, onError, onMode, onReset } = opt
  const mode = resolveMode()
  onMode && onMode(mode)

  let handle = null

  if (mode === 'rule') {
    handle = ruleStream({
      question,
      onDelta,
      onDone: () => onDone && onDone({ mode: 'rule' })
    })
    return { abort() { handle && handle.abort && handle.abort() } }
  }

  const base = { question, history, onDelta }
  let fellBack = false

  const fallback = () => {
    if (fellBack) return
    fellBack = true
    onError && onError(new Error('模型通道不可用，已切换离线推荐'))
    onReset && onReset() // 清掉模型已吐出的半截内容
    handle = ruleStream({
      question,
      onDelta,
      onDone: () => onDone && onDone({ mode: 'rule' })
    })
  }

  const runner = mode === 'cloud' ? cloudStream : localStream

  try {
    handle = runner({
      ...base,
      onDone: () => onDone && onDone({ mode }),
      onError: () => fallback()
    })
  } catch (e) {
    fallback()
  }

  return {
    abort() {
      if (handle && handle.abort) handle.abort()
    }
  }
}

module.exports = { ask, resolveMode, MODE_TEXT, systemPrompt }
