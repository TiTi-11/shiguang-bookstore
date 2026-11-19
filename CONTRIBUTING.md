# 参与贡献

感谢愿意花时间改进这个项目！下面是简单约定。

## 开发流程

1. Fork 本仓库并 clone 到本地
2. 新建分支：`git checkout -b feat/your-feature`
3. 提交改动（建议用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)）：
   ```
   feat: AI 推荐支持按预算筛选
   fix: 购物车数量为 0 时合计显示异常
   docs: 补充本地 Ollama 配置说明
   ```
4. 推送并提交 Pull Request

## 代码约定

| 项 | 约定 |
| --- | --- |
| 缩进 | 2 空格 |
| 引号 | 单引号（WXML 属性用双引号） |
| 分号 | 省略 |
| 命名 | 文件与页面目录用 kebab-case / 小写单词，方法用 camelCase |
| 注释 | 关键逻辑写"为什么"，不写"是什么" |
| 数据访问 | 页面不直接引用 `utils/mock.js`，统一走 `utils/db.js` |
| 存储 | 统一走 `utils/storage.js`，不要散落 `wx.setStorageSync` |

## 提交前自检

```bash
npm run check   # 静态检查：页面四件套、组件、图片、跳转、JSON
npm test        # 业务逻辑测试（Node 模拟 wx 环境）
```

CI 会对每个 PR 跑同样的检查，未通过不会合并。

## 关于 AI 密钥

**不要**把真实 API Key 提交进仓库。本地调试请放在 `utils/config.js`（该文件的默认值为空），
或者新建 `utils/config.local.js`（已在 `.gitignore` 中忽略）。
