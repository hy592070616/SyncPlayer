import { useState, useCallback, useRef, useEffect } from 'react'
import { useVideoRefs } from './useVideoRefs'

/**
 * 视频同步控制 Hook
 * 用于同步控制所有视频的播放、暂停状态
 * 处理浏览器 autoplay policy (Chrome muted autoplay 规则)
 */

/**
 * Hook 返回值类型
 */
export interface UseVideoSyncReturn {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 设置播放状态 (供外部组件使用) */
  setIsPlaying: (value: boolean) => void;
  /** 是否静音 (静音时可 autoplay) */
  isMuted: boolean;
  /** 设置静音状态 */
  setIsMuted: (value: boolean) => void;
  /** 当前播放时间 (秒) */
  currentTime: number;
  /** 设置当前时间 */
  setCurrentTime: (value: number) => void;
  /** 最大时长 (所有视频中最长的时长) */
  duration: number;
  /** 设置最大时长 */
  setDuration: (value: number) => void;
  /** 播放所有视频 */
  playAll: () => Promise<void>;
  /** 暂停所有视频 */
  pauseAll: () => void;
  /** 切换播放/暂停状态 */
  togglePlayPause: () => void;
  /** 跳转到指定时间 (所有视频同步跳转) */
  seekAll: (time: number) => void;
  /** 跳转指定帧数（正数前进，负数后退） */
  frameSkipMultiple: (frames: number) => void;
}

/**
 * 视频同步控制 Hook
 * @param videoRefs useVideoRefs Hook 返回的引用管理对象
 * @returns 同步控制函数和状态
 */
export function useVideoSync(
  videoRefs: ReturnType<typeof useVideoRefs>
): UseVideoSyncReturn {
  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  
  // 当前时间状态
  const [currentTime, setCurrentTime] = useState(0)
  
  // 最大时长状态 (所有视频中最长的时长)
  const [duration, setDuration] = useState(0)
  
  // 防止 seek 事件循环的标志
  const isSeekingRef = useRef(false)
  
  // 静音状态 (默认静音,满足 Chrome autoplay policy)
  const [isMuted, setIsMuted] = useState(true)

  /**
   * 播放所有视频
   * 处理 autoplay policy: 静音时可自动播放
   * 每个视频独立处理错误,不影响其他视频
   */
  const playAll = useCallback(async () => {
    const videos = videoRefs.getAllVideos()
    
    videos.forEach(async (video) => {
      try {
        if (isMuted) {
          // 静音播放 (符合 autoplay policy)
          video.muted = true
          // 静音播放即使失败也静默处理 (catch空函数)
          video.play().catch(() => {})
        } else {
          // 非静音播放 (需用户交互)
          await video.play()
        }
      } catch (error) {
        // 捕获 autoplay policy 错误并警告
        console.warn('Play failed:', error)
      }
    })
    
    // 设置播放状态为 true
    setIsPlaying(true)
  }, [videoRefs, isMuted])

  /**
   * 暂停所有视频
   */
  const pauseAll = useCallback(() => {
    const videos = videoRefs.getAllVideos()
    videos.forEach(video => video.pause())
    setIsPlaying(false)
  }, [videoRefs])

/**
    * 切换播放/暂停状态
    */
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAll()
    } else {
      playAll()
    }
  }, [isPlaying, playAll, pauseAll])

  /**
   * 计算并更新最大时长
   * 监听视频加载完成事件
   */
  useEffect(() => {
    const videos = videoRefs.getAllVideos()
    
    const updateMaxDuration = () => {
      const maxDuration = videos.reduce((max, video) => {
        // 只有已加载的视频才计算 duration
        if (video.duration > 0 && video.duration > max) {
          return video.duration
        }
        return max
      }, 0)
      
      setDuration(maxDuration)
    }
    
    // 初始计算
    updateMaxDuration()
    
    // 监听每个视频的 loadedmetadata 事件
    videos.forEach(video => {
      video.addEventListener('loadedmetadata', updateMaxDuration)
    })
    
    return () => {
      videos.forEach(video => {
        video.removeEventListener('loadedmetadata', updateMaxDuration)
      })
    }
  }, [videoRefs])

  /**
    * 跳转所有视频到指定时间
    * 短视频如果超过时长，停在最后一帧
    * @param time 目标时间 (秒)
    */
  const seekAll = useCallback((time: number) => {
    const videos = videoRefs.getAllVideos()
    
    // 设置 isSeeking 标志防止事件循环
    isSeekingRef.current = true
    
    videos.forEach(video => {
      // 短视频停在最后一帧 (seek 超过时长)
      if (time > video.duration) {
        video.currentTime = video.duration
      } else {
        video.currentTime = time
      }
    })
    
    // 更新当前时间状态
    setCurrentTime(time)
  }, [videoRefs])

  /**
   * 跳转指定帧数
   * 点击后自动暂停并跳转
   * @param frames 帧数（正数前进，负数后退）
   */
  const frameSkipMultiple = useCallback((frames: number) => {
    const frameDuration = 1 / 30; // 默认 30fps
    const newTime = Math.max(0, Math.min(currentTime + frames * frameDuration, duration));
    pauseAll();
    seekAll(newTime);
  }, [currentTime, duration, pauseAll, seekAll]);

  /**
    * 主视频 timeupdate 事件处理器
    * 只监听第一个视频 (主视频) 的播放进度
    */
  useEffect(() => {
    const videos = videoRefs.getAllVideos()
    const masterVideo = videos[0]
    
    if (!masterVideo) return
    
    const handleTimeUpdate = () => {
      // 如果正在 seek，不更新时间防止循环
      if (isSeekingRef.current) return
      
      setCurrentTime(masterVideo.currentTime)
    }
    
    masterVideo.addEventListener('timeupdate', handleTimeUpdate)
    
    return () => {
      masterVideo.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [videoRefs])

/**
     * 所有视频 seeking/seeked 事件处理器
     * 防止 seek 事件循环
     */
  useEffect(() => {
    const videos = videoRefs.getAllVideos()
    
    const handleSeeking = () => {
      isSeekingRef.current = true
    }
    
    const handleSeeked = () => {
      // 如果不是由我们的 seekAll 触发的 seek，直接返回
      if (!isSeekingRef.current) return
      isSeekingRef.current = false
    }
    
    videos.forEach(video => {
      video.addEventListener('seeking', handleSeeking)
      video.addEventListener('seeked', handleSeeked)
    })
    
    return () => {
      videos.forEach(video => {
        video.removeEventListener('seeking', handleSeeking)
        video.removeEventListener('seeked', handleSeeked)
      })
    }
  }, [videoRefs])

  return {
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    playAll,
    pauseAll,
    togglePlayPause,
    seekAll,
    frameSkipMultiple,
  }
}