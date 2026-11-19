/**
 * 全局业务配置
 * 说明：AI 密钥只放在本地 config 里调试，不要把真实 Key 提交到仓库。
 */
const config = {
  store: {
    name: '拾光书店',
    slogan: '把喜欢的书，放在手边',
    notice: '双十一专场：全场图书 8 折，满 100 减 30，仅限 3 天',
    phone: '400-800-1234',
    address: '江西省南昌市青山湖区 · 拾光书店旗舰店'
  },

  // 运费规则：满 99 包邮，否则 8 元
  freight: {
    fee: 8,
    freeAt: 99
  },

  ai: {
    // auto：有云端 Key 用云端，否则尝试本地 Ollama，都不可用则走离线推荐
    // 也可固定为 cloud / local / rule
    mode: 'auto',
    cloud: {
      baseUrl: 'https://api.deepseek.com',
      apiKey: '',
      model: 'deepseek-chat'
    },
    local: {
      baseUrl: 'http://127.0.0.1:11434',
      model: 'qwen2.5'
    },
    timeout: 30000,
    maxHistory: 8
  }
}

module.exports = config
