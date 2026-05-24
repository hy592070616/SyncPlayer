import { useState } from 'react'
import './ControlPanel.css'

/**
 * 控制面板组件属性接口
 */
export interface ControlPanelProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放/暂停切换回调 */
  onPlayPauseToggle: () => void;
  /** 跳转指定帧数回调 */
  onFrameSkipMultiple: (frames: number) => void;
  /** 所有视频是否已准备好 */
  allVideosReady: boolean;
}

/**
 * 控制面板组件
 * 提供播放控制按钮：播放/暂停、上/下N帧
 */
export function ControlPanel({
  isPlaying,
  onPlayPauseToggle,
  onFrameSkipMultiple,
  allVideosReady,
}: ControlPanelProps) {
  const [frameCount, setFrameCount] = useState(5);

  const handleFrameCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFrameCount(value);
    }
  };

  return (
    <div className="control-panel">
      <button
        className="control-btn play-pause-btn"
        onClick={onPlayPauseToggle}
        disabled={!allVideosReady}
        aria-label={isPlaying ? '暂停' : '播放'}
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <div className="frame-skip-custom">
        <button
          className="control-btn"
          onClick={() => onFrameSkipMultiple(-frameCount)}
          disabled={!allVideosReady}
          aria-label={`上${frameCount}帧`}
          title={`上${frameCount}帧`}
        >
          上{frameCount}帧
        </button>

        <input
          type="number"
          value={frameCount}
          onChange={handleFrameCountChange}
          min="1"
          className="frame-count-input"
          aria-label="间隔帧数"
        />

        <button
          className="control-btn"
          onClick={() => onFrameSkipMultiple(frameCount)}
          disabled={!allVideosReady}
          aria-label={`下${frameCount}帧`}
          title={`下${frameCount}帧`}
        >
          下{frameCount}帧
        </button>
      </div>
    </div>
  )
}