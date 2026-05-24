import './ProgressBar.css'

/**
 * 进度条组件属性接口
 */
export interface ProgressBarProps {
  /** 当前播放时间 (秒) */
  currentTime: number
  /** 总时长 (秒) */
  duration: number
  /** 跳转回调 (seek-on-commit 模式，只在拖动结束时触发) */
  onSeek: (time: number) => void
  /** 格式化时间函数 */
  formatTime: (seconds: number) => string
}

/**
 * 进度条组件
 * 统一的进度控制条，支持拖动跳转
 * 实现 seek-on-commit 模式：只在拖动结束时触发 seek，避免过度 API 调用
 */
export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  formatTime,
}: ProgressBarProps) {
  /**
   * 进度条值变化时处理
   * 只更新视觉显示，不触发 seek（seek-on-commit 模式）
   */
  const handleProgressChange = () => {
    // 进度条拖动过程中不执行 seek
    // 只更新视觉显示（通过 value prop 控制）
  }

  /**
   * 进度条拖动结束时处理
   * 触发 seek 到目标时间点
   */
  const handleProgressCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    const newTime = parseFloat(target.value)
    onSeek(newTime)
  }

  /**
   * 计算进度条百分比
   * 用于样式和视觉反馈
   */
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="progress-bar-container">
      {/* 时间显示 */}
      <div className="progress-bar-time">
        <span className="current-time">{formatTime(currentTime)}</span>
        <span className="time-separator">/</span>
        <span className="duration-time">{formatTime(duration)}</span>
      </div>

      {/* 进度条 */}
      <input
        type="range"
        className="progress-bar-input"
        min={0}
        max={duration}
        step={0.1}
        value={currentTime}
        onChange={handleProgressChange}
        onMouseUp={handleProgressCommit}
        onTouchEnd={handleProgressCommit}
        aria-label="视频进度"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={formatTime(currentTime)}
        disabled={duration === 0}
        style={{
          // 设置进度条背景（显示已播放部分）
          background: `linear-gradient(to right, var(--color-primary) ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%)`,
        }}
      />
    </div>
  )
}