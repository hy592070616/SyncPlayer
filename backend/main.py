from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SyncPlayer Backend")

# CORS配置 - 支持视频流式传输所需头
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["content-type", "accept-ranges", "content-length", "content-range"],
)

# 静态文件服务 - 视频文件目录
app.mount("/videos", StaticFiles(directory="static/videos"), name="videos")


@app.get("/")
async def root():
    """服务状态检查"""
    return {"status": "ok"}


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"health": "ok"}