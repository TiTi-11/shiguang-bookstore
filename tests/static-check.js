/**
 * 静态检查：JSON 合法性、页面文件完整性、组件与图片引用、跳转目标
 * 运行：node tests/static-check.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const errors = []
const warnings = []

function walk(dir, filter, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, filter, out)
    else if (filter(name)) out.push(full)
  }
  return out
}

/* 1. JSON 合法性 */
const jsonFiles = walk(ROOT, (n) => n.endsWith('.json'))
for (const file of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`JSON 解析失败: ${path.relative(ROOT, file)} -> ${e.message}`)
  }
}

/* 2. 页面四件套 */
const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'))
for (const page of app.pages) {
  for (const ext of ['js', 'json', 'wxml', 'wxss']) {
    const file = path.join(ROOT, `${page}.${ext}`)
    if (!fs.existsSync(file)) errors.push(`缺少页面文件: ${page}.${ext}`)
  }
}

/* 3. usingComponents 指向的组件是否存在 */
for (const file of jsonFiles) {
  let data
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    continue
  }
  const comps = data.usingComponents || {}
  for (const [name, target] of Object.entries(comps)) {
    const base = path.join(ROOT, target.replace(/^\//, ''))
    if (!fs.existsSync(base + '.js')) {
      errors.push(`组件不存在: ${path.relative(ROOT, file)} -> ${target}`)
    }
  }
}

/* 4. 图片引用（含脚本生成的封面 c01-c32） */
const imgReg = /["'](\/images\/[^"']+\.(?:png|jpg|jpeg|webp|gif))["']/g
const sources = walk(ROOT, (n) => ['.js', '.wxml', '.json', '.wxss'].some((e) => n.endsWith(e)))
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8')
  let m
  while ((m = imgReg.exec(text))) {
    const target = path.join(ROOT, m[1].replace(/^\//, ''))
    if (!fs.existsSync(target)) {
      errors.push(`图片缺失: ${path.relative(ROOT, file)} 引用 ${m[1]}`)
    }
  }
}
for (let i = 1; i <= 32; i++) {
  const cover = path.join(ROOT, 'images', 'covers', `c${String(i).padStart(2, '0')}.jpg`)
  if (!fs.existsSync(cover)) errors.push(`封面缺失: c${String(i).padStart(2, '0')}.jpg`)
}

/* 5. 跳转目标是否在 app.json 注册 */
const pages = new Set(app.pages)
const navReg = /url:\s*['"](\/pages\/[^'"?#]+)/g
for (const file of walk(ROOT, (n) => n.endsWith('.js'))) {
  const text = fs.readFileSync(file, 'utf8')
  let m
  while ((m = navReg.exec(text))) {
    const page = m[1].replace(/^\//, '')
    if (!pages.has(page)) {
      errors.push(`跳转目标未注册: ${path.relative(ROOT, file)} -> ${m[1]}`)
    }
  }
}

/* 6. 代码卫生 */
for (const file of walk(ROOT, (n) => n.endsWith('.js')).filter((p) => !p.includes('tests'))) {
  const text = fs.readFileSync(file, 'utf8')
  if (/console\.(log|debug)\(/.test(text)) {
    warnings.push(`${path.relative(ROOT, file)} 含调试输出`)
  }
}

/* 输出 */
console.log(`扫描：${jsonFiles.length} 个 JSON，${app.pages.length} 个页面`)
if (warnings.length) {
  console.log('\n提示：')
  warnings.forEach((w) => console.log('  - ' + w))
}
if (errors.length) {
  console.error(`\n发现 ${errors.length} 个问题：`)
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log('\n静态检查通过 ✓')
