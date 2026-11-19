/**
 * 流式解码工具
 * 小程序的 onChunkReceived 给的是 ArrayBuffer，一个中文字符可能被切在两个分片里，
 * 所以需要自己做一个"带残留缓冲"的 UTF-8 解码器。
 */

function createDecoder() {
  let pending = []

  return function decode(arrayBuffer) {
    const incoming = Array.prototype.slice.call(new Uint8Array(arrayBuffer))
    const bytes = pending.concat(incoming)
    let text = ''
    let i = 0

    while (i < bytes.length) {
      const b0 = bytes[i]
      let need = 0
      let code = 0

      if (b0 < 0x80) {
        text += String.fromCharCode(b0)
        i += 1
        continue
      } else if ((b0 & 0xe0) === 0xc0) {
        need = 1
        code = b0 & 0x1f
      } else if ((b0 & 0xf0) === 0xe0) {
        need = 2
        code = b0 & 0x0f
      } else if ((b0 & 0xf8) === 0xf0) {
        need = 3
        code = b0 & 0x07
      } else {
        i += 1
        continue
      }

      if (i + need >= bytes.length) break // 半个字符，留到下一块

      for (let k = 1; k <= need; k++) {
        code = (code << 6) | (bytes[i + k] & 0x3f)
      }
      text += String.fromCodePoint(code)
      i += need + 1
    }

    pending = bytes.slice(i)
    return text
  }
}

/**
 * 行缓冲：把流式文本按行切好再交给回调
 */
function createLineReader(onLine) {
  let buffer = ''
  return function push(text) {
    buffer += text
    const lines = buffer.split('\n')
    buffer = lines.pop()
    lines.forEach((line) => onLine(line))
  }
}

module.exports = { createDecoder, createLineReader }
