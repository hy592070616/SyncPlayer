import { useState, useCallback, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import type { Video } from '../types'
import { useVideoRefs } from '../hooks/useVideoRefs'
import { useVideoSync } from '../hooks/useVideoSync'
import { FileSelector } from './FileSelector'
import VideoGrid from './VideoGrid'
import { ControlPanel } from './ControlPanel'
import { ProgressBar } from './ProgressBar'
import './MultiVideoPlayer.css'

/**
 * 性能警告阈值
 */
const PERFORMANCE_WARNING_THRESHOLD = 9

/**
 * MultiVideoPlayer 主组件
 * 整合所有子组件，实现多视频同步播放功能
 */
export function MultiVideoPlayer() {
  // 视频列表状态
  const [videos, setVideos] = useState<Video[]>([])

  // 性能警告状态
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false)

  // 视频宽度状态（数字 + 单位）
  const [videoWidth, setVideoWidth] = useState<number>(0)
  const [widthInputValue, setWidthInputValue] = useState<string>('0')
  const [videoWidthUnit, setVideoWidthUnit] = useState<'px' | '%'>('px')

  // 自定义宽度布局相关
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // 视频引用管理
  const videoRefs = useVideoRefs()

  // 视频同步控制
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    togglePlayPause,
    seekAll,
    frameSkipMultiple,
  } = useVideoSync(videoRefs)

  /**
   * 格式化时间显示
   * @param seconds 秒数
   * @returns 格式化的时间字符串（MM:SS）
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  /**
   * 处理文件选择（追加模式）
   */
  const handleSelectFiles = useCallback((newVideos: Video[]) => {
    setVideos((prevVideos) => {
      const totalVideos = prevVideos.length + newVideos.length
      // 如果总视频数超过阈值，显示性能警告
      if (totalVideos > PERFORMANCE_WARNING_THRESHOLD) {
        setShowPerformanceWarning(true)
      }
      return [...prevVideos, ...newVideos]
    })
  }, [])

  /**
   * 处理重置视频
   */
  const handleResetVideos = useCallback(() => {
    // 清理所有 Blob URL 避免内存泄漏
    videos.forEach((video) => {
      URL.revokeObjectURL(video.url)
    })
    videoRefs.clearRefs()
    setVideos([])
    setShowPerformanceWarning(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [videos, videoRefs, setIsPlaying, setCurrentTime, setDuration])

  /**
   * 关闭性能警告
   */
  const handleClosePerformanceWarning = useCallback(() => {
    setShowPerformanceWarning(false)
  }, [])

  /**
   * 处理视频加载完成（更新 duration 和 aspectRatio）
   */
  const handleLoadedMetadata = useCallback(
    (videoId: string, e: React.SyntheticEvent<HTMLVideoElement>) => {
      const videoElement = e.currentTarget
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === videoId
            ? {
                ...v,
                duration: videoElement.duration,
                aspectRatio: videoElement.videoWidth / videoElement.videoHeight,
                isReady: true,
              }
            : v
        )
      )
    },
    []
  )

  /**
   * 处理视频加载错误
   */
  const handleError = useCallback((videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((v) =>
        v.id === videoId ? { ...v, hasError: true, isReady: false } : v
      )
    )
  }, [])

  /**
   * 检查所有视频是否已准备好
   */
  const allVideosReady = videos.length > 0 && videos.every((v) => v.isReady || v.hasError)

  /**
   * 主视频 ID（第一个视频）
   */
  const masterVideoId = videos.length > 0 ? videos[0].id : null

  /**
   * 错误统计
   */
  const errorCount = videos.filter((v) => v.hasError).length

  const handleWidthInputChange = (value: string) => {
    const filtered = value.replace(/[^0-9]/g, '')
    setWidthInputValue(filtered)
    if (filtered === '') return
    const num = parseInt(filtered, 10)
    const clamped = videoWidthUnit === '%' ? Math.min(100, num) : num
    setVideoWidth(clamped)
  }

  /**
   * 计算 Grid 布局列数（仅自适应模式使用）
   */
  const getGridTemplateColumns = (): string | undefined => {
    if (videoWidth === 0) return undefined
    if (videoWidthUnit === '%') {
      const columns = Math.floor(100 / videoWidth)
      return `repeat(${columns}, 1fr)`
    }
    return `repeat(auto-fill, minmax(${videoWidth}px, 1fr))`
  }

  /**
   * 同步读取容器初始宽度（避免首次渲染时 containerWidth 为 0 导致计算错误）
   */
  useLayoutEffect(() => {
    const el = gridContainerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth)
  }, [videoWidth > 0])

  /**
   * 监听容器宽度变化（px 模式下需要知道容器宽度来计算每行视频数）
   */
  useEffect(() => {
    const el = gridContainerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [videoWidth > 0])

  /**
   * 计算每行可容纳的视频数量
   */
  const getItemsPerRow = (): number => {
    if (videoWidth === 0) return 0
    if (videoWidthUnit === '%') {
      return Math.max(1, Math.floor(100 / videoWidth))
    }
    if (containerWidth <= 0) return 1
    const gap = 8
    return Math.max(1, Math.floor((containerWidth + gap) / (videoWidth + gap)))
  }

  /**
   * 自定义宽度模式下，将视频按行分组渲染
   * - 首行（无论是否满行）：居中
   * - 非末行的满行：居中
   * - 末行（未满且非首行）：与首行视频元素最左侧对齐
   */
  const renderCustomWidthRows = (): ReactNode[] => {
    const itemsPerRow = getItemsPerRow()
    if (itemsPerRow <= 0) return []

    const gap = 8
    const rows: ReactNode[] = []

    // 计算首行居中时第一个视频元素的左侧偏移量（px 模式下末行需对齐该位置）
    const leftOffset = videoWidthUnit === 'px' && containerWidth > 0
      ? Math.max(0, (containerWidth - (itemsPerRow * videoWidth + (itemsPerRow - 1) * gap)) / 2)
      : 0

    for (let i = 0; i < videos.length; i += itemsPerRow) {
      const rowVideos = videos.slice(i, i + itemsPerRow)
      const isFirstRow = i === 0
      const isRowFull = rowVideos.length === itemsPerRow

      // 首行始终居中；满行均居中；末行（未满且非首行）与首行视频元素最左侧对齐
      const centerRow = isFirstRow || isRowFull

      rows.push(
        <div
          key={`row-${i}`}
          className="video-grid-row"
          style={{
            justifyContent: centerRow ? 'center' : 'flex-start',
            ...(!centerRow && leftOffset > 0 ? { paddingLeft: `${leftOffset}px` } : {}),
          }}
        >
          {rowVideos.map((video) => (
            <div
              key={video.id}
              className="video-grid-cell"
              style={{
                width: videoWidthUnit === '%'
                  ? `calc((100% - ${(itemsPerRow - 1) * gap}px) / ${itemsPerRow})`
                  : `${videoWidth}px`,
              }}
            >
              <VideoCardWithEvents
                video={video}
                onSaveRef={videoRefs.saveVideoRef}
                isMaster={video.id === masterVideoId}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
              />
            </div>
          ))}
        </div>
      )
    }
    return rows
  }

  return (
    <div className="multi-video-player">
      {/* 性能警告 */}
      {showPerformanceWarning && (
        <div className="performance-warning" role="alert">
          <div className="performance-warning-content">
            <svg className="performance-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="performance-warning-text">
              超过 {PERFORMANCE_WARNING_THRESHOLD} 个视频可能影响性能，建议减少视频数量以获得最佳体验
            </span>
          </div>
          <button
            className="performance-warning-close"
            onClick={handleClosePerformanceWarning}
            aria-label="关闭警告"
          >
            ×
          </button>
        </div>
      )}

      {/* 文件选择区域 */}
      <FileSelector
        onSelectFiles={handleSelectFiles}
        existingCount={videos.length}
        onReset={handleResetVideos}
      />

      {/* 显示设置区域 */}
      {videos.length > 0 && (
        <div className="display-settings">
          <div className="video-width-selector">
            <label htmlFor="video-width-input">视频宽度：</label>
            <input
              id="video-width-input"
              type="text"
              inputMode="numeric"
              value={widthInputValue}
              onChange={(e) => handleWidthInputChange(e.target.value)}
              className="width-input"
              onBlur={() => {
                if (widthInputValue === '') {
                  setWidthInputValue(String(videoWidth))
                }
              }}
            />
            <select
              value={videoWidthUnit}
              onChange={(e) => setVideoWidthUnit(e.target.value as 'px' | '%')}
              className="width-unit-select"
            >
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
            <button
              onClick={() => {
                setVideoWidth(0)
                setWidthInputValue('0')
                setVideoWidthUnit('px')
              }}
              className="width-reset-btn"
              title="重置为自适应"
            >
              自适应
            </button>
          </div>
        </div>
      )}

      {/* 视频网格区域 */}
      {videos.length > 0 && (
        videoWidth > 0 ? (
          <div className="video-grid video-grid--custom" ref={gridContainerRef}>
            {renderCustomWidthRows()}
          </div>
        ) : (
          <VideoGrid gridTemplateColumns={getGridTemplateColumns()}>
            {videos.map((video) => (
              <VideoCardWithEvents
                key={video.id}
                video={video}
                onSaveRef={videoRefs.saveVideoRef}
                isMaster={video.id === masterVideoId}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
              />
            ))}
          </VideoGrid>
        )
      )}

      {/* 错误统计 */}
      {errorCount > 0 && (
        <div className="error-stats" role="status">
          <svg className="error-stats-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="error-stats-text">
            {errorCount} 个视频加载失败（共 {videos.length} 个）
          </span>
        </div>
      )}

      {/* 进度条 */}
      {videos.length > 0 && (
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seekAll}
          formatTime={formatTime}
        />
      )}

      {/* 控制面板 */}
      {videos.length > 0 && (
        <ControlPanel
          isPlaying={isPlaying}
          onPlayPauseToggle={togglePlayPause}
          onFrameSkipMultiple={frameSkipMultiple}
          allVideosReady={allVideosReady}
        />
      )}
    </div>
  )
}

/**
 * VideoCard 扩展组件（支持事件处理）
 */
interface VideoCardWithEventsProps {
  video: Video
  onSaveRef: (id: string) => (element: HTMLVideoElement | null) => void
  isMaster: boolean
  onLoadedMetadata: (videoId: string, e: React.SyntheticEvent<HTMLVideoElement>) => void
  onError: (videoId: string) => void
}

function VideoCardWithEvents({
  video,
  onSaveRef,
  onLoadedMetadata,
  onError,
}: VideoCardWithEventsProps) {
  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onLoadedMetadata(video.id, e)
    },
    [video.id, onLoadedMetadata]
  )

  const handleError = useCallback(() => {
    onError(video.id)
  }, [video.id, onError])

  const isLandscape = video.aspectRatio >= 1
  const displayAspectRatio = isLandscape ? 16 / 9 : 9 / 16

  return (
    <div
      className="video-card-wrapper"
      style={{
        aspectRatio: `${displayAspectRatio}`,
      }}
    >
      <div className="video-card-label">
        {video.name}
      </div>
      {video.hasError ? (
        <div className="video-card-error-placeholder">
          <svg className="video-card-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="video-card-error-text">加载失败</span>
        </div>
      ) : (
        <video
          ref={onSaveRef(video.id)}
          className="video-card-element"
          src={video.url}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          playsInline
          muted
        />
      )}
    </div>
  )
}