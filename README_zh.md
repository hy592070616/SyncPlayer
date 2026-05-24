<p align="center">
  <h1 align="center">多视频同步播放器</h1>
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18.3"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript 5.5"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5.4"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi" alt="FastAPI"></a>
  <a href="https://github.com/anomalyco/SyncPlayer/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL-blue" alt="GPL License"></a>
</p>

<p align="center">多视频同步播放 Web 应用</p>

<p align="center">
  <img src="assets/Frontend.png" alt="SyncPlayer 界面截图" width="80%" />
</p>

<p align="center">
  <a href="README.md">English Version README</a>
</p>

SyncPlayer 是一个支持同时加载并同步播放多个本地视频文件的 Web 应用，适用于动作分析、视频对比、多角度回放等场景。

## 功能特性

- **同步播放控制** — 同时播放/暂停/跳转所有视频，保持进度一致
- **帧级精确定位** — 支持逐帧前进/后退（基于 30fps），适合精细分析
- **统一进度条** — 单一滑块控制所有视频，采用 seek-on-commit 模式
- **本地文件处理** — 视频通过 Blob URL 在前端处理，无需上传至服务器
- **自适应网格布局** — CSS Grid 自动排列视频，保持原始宽高比
- **追加模式** — 可动态添加更多视频，无数量硬限制
- **性能预警** — 超过 9 个视频时自动提示性能影响
- **错误容错** — 单个视频加载失败显示错误占位，不影响其他视频播放
- **视频静态服务** — 内置 FastAPI 后端提供测试视频，支持 Range Request 流式传输

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+ 或 [Bun](https://bun.sh/)
- [Python](https://python.org/) 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)（Python 包管理器）
- 现代浏览器（Chrome、Firefox、Edge、Safari）

### 安装与启动

```bash
# 克隆仓库
git clone git@github.com:hy592070616/SyncPlayer.git
cd SyncPlayer

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
uv sync
cd ..

# 同时启动前后端
npm run dev:full
```

- **前端地址：** http://localhost:5173
- **后端 API：** http://localhost:8000
- **API 文档：** http://localhost:8000/docs

## 使用说明

1. 点击 **选择视频** 按钮选取本地视频文件
2. 使用 **播放/暂停** 按钮同步控制所有视频
3. 拖拽 **进度条** 跳转到任意时间点
4. 使用 **帧级步进** 按钮进行逐帧精准定位
5. 点击 **添加更多视频** 继续追加文件

> 所有视频默认静音播放（受浏览器 autoplay policy 限制）。
> 进度条以最长视频的时长为基准，短视频超出时长时会停在最后一帧。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 5 |
| 后端 | FastAPI (Python 3.11+) |
| 包管理（前端） | Bun / npm |
| 包管理（后端） | uv |

## 项目结构

```
SyncPlayer/
├── src/                        # 前端源码
│   ├── components/             # React 组件
│   │   ├── MultiVideoPlayer.tsx   # 主编排组件
│   │   ├── FileSelector.tsx       # 文件选择器
│   │   ├── VideoGrid.tsx          # 网格布局
│   │   ├── ControlPanel.tsx       # 播放控制面板
│   │   ├── ProgressBar.tsx        # 统一进度条
│   │   └── __tests__/             # 组件测试
│   ├── hooks/                  # 自定义 React Hooks
│   │   ├── useVideoSync.ts        # 同步逻辑
│   │   ├── useVideoRefs.ts        # DOM 引用管理
│   │   └── __tests__/             # Hook 测试
│   ├── types/                  # TypeScript 类型定义
│   ├── App.tsx                 # 应用入口
│   └── main.tsx                # React 根节点
├── backend/                    # Python 后端
│   ├── main.py                 # FastAPI 应用
│   ├── pyproject.toml          # Python 依赖
│   └── static/videos/          # 示例视频
├── assets/                     # 静态资源（截图等）
├── start.bat                   # Windows 启动脚本
├── start.sh                    # Unix 启动脚本
└── vite.config.ts              # Vite 配置
```

## 后端 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 服务状态 |
| `/health` | GET | 健康检查 |
| `/videos/{filename}` | GET | 视频文件服务（支持 Range Request） |
| `/docs` | GET | Swagger 接口文档 |

## 架构说明

**数据流：** `选择文件 → 创建 Blob URL → React 状态 → useVideoSync hook → 视频元素`

**同步机制：**
- 同时对全部 `<video>` 元素调用 `play()` / `pause()`
- 所有视频的 `currentTime` 同步跳转，短视频超出时长后停在最后一帧
- 帧步进以固定 1/30 秒为间隔
- 仅监听主视频（列表中第一个）的 `timeupdate` 事件驱动进度条更新

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/awesome-feature`）
3. 提交更改（`git commit -m 'Add awesome feature'`）
4. 推送分支（`git push origin feature/awesome-feature`）
5. 提交 Pull Request

## 许可证

基于 GPL V2.1 License 分发，详见 `LICENSE` 文件。

