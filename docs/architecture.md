# 架构说明

## 分层

```mermaid
flowchart TD
  subgraph Pages["页面层 pages/*"]
    P1[index 首页]
    P2[category 分类]
    P3[detail 详情]
    P4[cart 购物车]
    P5[checkout / result 下单]
    P6[ai AI 推荐官]
    P7[orders / favorites / profile / login]
  end

  subgraph Components["组件层"]
    C1[book-card 图书卡片]
  end

  subgraph Utils["服务层 utils/*"]
    U1[db.js 查询]
    U2[cart / fav / order / user 业务服务]
    U3[storage.js 本地存储]
    U4[ai.js 通道调度]
    U5[stream.js 流式解码]
    U6[util.js 工具]
  end

  subgraph Data["数据源"]
    D1[mock.js 12 分类 / 32 本图书]
    D2[(wx.storage)]
    D3[DeepSeek / Ollama]
  end

  Pages --> Components
  Pages --> Utils
  U1 --> D1
  U2 --> U3
  U3 --> D2
  U4 --> U5
  U4 --> D3
  U2 --> U1
```

**约定**：页面不直接读 `mock.js`，也不直接调 `wx.setStorageSync`。
换真实后端时，只需把 `db.js` 内部实现改成 `wx.request`，页面零改动。

## AI 三条通道

```mermaid
stateDiagram-v2
  [*] --> ResolveMode
  ResolveMode --> Cloud: 配置了云端 Key
  ResolveMode --> Local: 未配置 Key
  Cloud --> Done: SSE 正常返回
  Cloud --> Local: 请求失败 / 超时
  Local --> Done: JSONL 正常返回
  Local --> Rule: 连不上 Ollama
  Rule --> Done: 本地规则流式输出
  Done --> [*]
```

- **cloud**：OpenAI 兼容接口（DeepSeek），`data: {...}` SSE 分帧
- **local**：Ollama `/api/chat`，每行一个 JSON
- **rule**：关键词 → 分类 → 高分书，仍按流式节奏输出，保证演示可用

## 一次流式问答的时序

```mermaid
sequenceDiagram
  participant Page as pages/ai
  participant AI as utils/ai.js
  participant Stream as utils/stream.js
  participant LLM as 模型服务

  Page->>AI: ask({question, history, onDelta})
  AI->>LLM: wx.request(enableChunked, stream:true)
  loop 每个分片
    LLM-->>AI: onChunkReceived(ArrayBuffer)
    AI->>Stream: decode(分片) + 按行切分
    Stream-->>AI: 增量文本
    AI-->>Page: onDelta(text)
    Page->>Page: 60ms 节流 setData，逐字渲染
  end
  LLM-->>AI: [DONE]
  AI-->>Page: onDone({mode})
  Page->>Page: 解析 [BOOKS:1,2,3] 渲染图书卡片
```

## 为什么需要自己解 UTF-8

`onChunkReceived` 给的是 `ArrayBuffer`，中文一个字 3 字节，网络分片边界常常正好切在字符中间。
`String.fromCharCode` 逐字节转换会出乱码，因此 `utils/stream.js` 实现了带残留缓冲的解码器：

```js
if (i + need >= bytes.length) break   // 尾部不完整，留到下一块
pending = bytes.slice(i)
```
