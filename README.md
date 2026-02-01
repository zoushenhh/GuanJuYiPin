<h1 align="center">县令（Xian Ling）</h1>

<p align="center">
  <strong>AI 驱动的沉浸式古代县令模拟器</strong>
</p>

<p align="center">
  <a href="https://github.com/qianye60/XianTu">🔗 原项目：qianye60/XianTu</a> •
  <a href="#功能概览">功能</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3"/>
  <img src="https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Pinia-yellow?style=flat-square&logo=vue.js&logoColor=white" alt="Pinia"/>
  <img src="https://img.shields.io/badge/Webpack-5-8DD6F9?style=flat-square&logo=webpack&logoColor=black" alt="Webpack"/>
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/AI-Claude-orange?style=flat-square&logo=anthropic&logoColor=white" alt="Claude"/>
  <img src="https://img.shields.io/badge/AI-OpenAI-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/SillyTavern-兼容-purple?style=flat-square" alt="SillyTavern"/>
</p>


---

## 功能概览

**AI 动态叙事** — 支持 Gemini / Claude / OpenAI / DeepSeek 等多种大模型，实时生成个性化剧情

**九品官制** — 完整的宋代文官武官体系，从九品到正一品的晋升之路

**朝代出身系统** — 选择秦、汉、唐、宋等多个朝代背景，不同地域出身赋予独特属性加成

**政务方略** — 治国方略、政务处理、衙门管理，多维度治理系统

**官场建筑** — 升级衙门各类建筑，提升政务效率和治理能力

**智能判定** — 基于官品、属性、装备、方略等多维度计算判定结果

**NPC 关系** — 互动交流，建立人际关系网络，NPC 间关系矩阵动态演化

**多存档管理** — 多角色、多存档槽位，支持导入导出

**全平台适配** — 完美支持桌面端与移动端，亮/暗双主题

**酒馆兼容** — 支持 SillyTavern 嵌入式环境与独立网页版

---

## 🛠️ 技术栈

|        前端        |        后端        |     AI     |
| :----------------: | :-----------------: | :---------: |
| Vue 3 + TypeScript |  Python + FastAPI  | Gemini API |
|   Pinia 状态管理   | SQLite / PostgreSQL | Claude API |
|     Vue Router     |      JWT 认证      | OpenAI API |
|      Webpack      |      WebSocket      | SillyTavern |
| Chart.js + Pixi.js |                    |  DeepSeek  |
|     IndexedDB     |                    |            |

---

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run serve

# 生产构建
npm run build
```

## ☁️ 自动构建/部署

推送 `v*` 格式的 tag 时自动触发：

- **Docker 镜像**：构建并推送到 Docker Hub
- **GitHub Release**：创建 Release 并上传构建产物 zip 包

```bash
git tag v3.7.0
git push origin v3.7.0
```

其他工作流：

- CI：`.github/workflows/ci.yml`（push/PR 自动 `type-check` + `build`）
- Pages：`.github/workflows/pages.yml`（push 到 `master` 自动部署到 GitHub Pages）

### 后端（可选）

后端用于提供账号/存档等 API，默认使用 SQLite，开箱即用。

```bash
pip install -r server/requirements.txt
uvicorn server.main:app --reload --port 12345
```

环境变量配置见 `server/.env.example`

---

## 📖 更新日志

查看完整更新历史：[CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

本项目基于原项目 [qianye60/XianTu](https://github.com/qianye60/XianTu) 修改而来。

原项目个人学习、研究免费使用。商业用途请先联系原作者。
