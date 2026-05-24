<p align="center">
  <h1 align="center">SyncPlayer 多视频同步播放器</h1>
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18.3"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript 5.5"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5.4"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi" alt="FastAPI"></a>
  <a href="https://github.com/anomalyco/SyncPlayer/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL-blue" alt="GPL License"></a>
</p>

<p align="center">多视频同步播放 Web 应用</p>
<p align="center">Multi-video synchronized playback web application</p>

<p align="center">
  <img src="assets/Frontend.png" alt="SyncPlayer Screenshot" width="80%" />
</p>

<p align="center">
  <a href="README_zh.md">中文版 README</a>
</p>

SyncPlayer is a web application that loads and plays multiple local video files simultaneously with synchronized playback controls. Designed for motion analysis, video comparison, and multi-angle viewing scenarios.

SyncPlayer 是一个支持同时加载并同步播放多个本地视频文件的 Web 应用，适用于动作分析、视频对比、多角度回放等场景。

## Features

- **Synchronized Playback** — Play, pause, and seek across all videos simultaneously
- **Frame-level Control** — Step forward/backward by single frame (at 30 fps) for precise analysis
- **Unified Progress Bar** — Single slider with seek-on-commit mode controls all videos
- **Local File API** — All videos processed client-side via Blob URLs; nothing uploaded to servers
- **Adaptive Grid Layout** — CSS Grid auto-arranges videos maintaining original aspect ratios
- **Append Mode** — Add more videos dynamically with no hard limit on count
- **Performance Warning** — Alert shown when exceeding 9 videos
- **Fault Tolerance** — Individual video load failures show an error placeholder without blocking others
- **Static Video Server** — Built-in FastAPI backend serves test videos with Range Request support

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Python](https://python.org/) 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)
- Modern browser (Chrome, Firefox, Edge, Safari)

### Install & Run

```bash
# Clone the repository
git clone git@github.com:hy592070616/SyncPlayer.git
cd SyncPlayer

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
uv sync
cd ..

# Start both frontend and backend
npm run dev:full
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Usage

1. Click **Select Videos** to choose local video files
2. Use the **Play/Pause** button to control all videos synchronously
3. Drag the **progress bar** to seek to any point in time
4. Use **frame step** buttons (forward/backward) for frame-accurate navigation
5. Click **Add More Videos** to append additional files

> All videos play muted by default (required by browser autoplay policy).
> The progress bar reflects the longest video's duration; shorter videos freeze on their last frame when exceeded.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Backend | FastAPI (Python 3.11+) |
| Package (Frontend) | Bun / npm |
| Package (Backend) | uv |

## Project Structure

```
SyncPlayer/
├── src/                        # Frontend source
│   ├── components/             # React components
│   │   ├── MultiVideoPlayer.tsx   # Main orchestrator
│   │   ├── FileSelector.tsx       # File picker
│   │   ├── VideoGrid.tsx          # Grid layout
│   │   ├── ControlPanel.tsx       # Playback controls
│   │   ├── ProgressBar.tsx        # Unified progress slider
│   │   └── __tests__/             # Component tests
│   ├── hooks/                  # Custom React hooks
│   │   ├── useVideoSync.ts        # Sync logic
│   │   ├── useVideoRefs.ts        # DOM ref management
│   │   └── __tests__/             # Hook tests
│   ├── types/                  # TypeScript definitions
│   ├── App.tsx                 # App entry
│   └── main.tsx                # React root
├── backend/                    # Python backend
│   ├── main.py                 # FastAPI app
│   ├── pyproject.toml          # Python dependencies
│   └── static/videos/          # Sample videos
├── assets/                     # Static assets (screenshots)
├── start.bat                   # Windows launcher
├── start.sh                    # Unix launcher
└── vite.config.ts              # Vite configuration
```

## Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service status |
| `/health` | GET | Health check |
| `/videos/{filename}` | GET | Serve video files (supports Range Requests) |
| `/docs` | GET | Swagger UI documentation |

## Architecture Overview

**Data flow:** `File selection → Blob URL creation → React state → useVideoSync hook → Video elements`

**Sync mechanism:**
- Calls `play()` / `pause()` on all `<video>` elements simultaneously
- Seek is applied to every video's `currentTime`; shorter videos freeze at their last frame
- Frame stepping uses a fixed interval of 1/30 s
- Only the master video (first in the list) drives progress bar updates via `timeupdate`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## License

Distributed under the GPL v2.1 License. See `LICENSE` for more information.
