import { useRef, useCallback } from 'react'

/**
 * 视频元素引用管理 Hook
 * 使用 callback refs + Map 的 React 官方推荐模式
 * 用于管理多个动态视频元素的引用
 */
export function useVideoRefs() {
  const videoRefsMap = useRef<Map<string, HTMLVideoElement>>(new Map())

  /**
   * 保存视频元素引用的回调函数
   * @param id 视频的唯一标识符
   * @returns 用于 ref 属性的回调函数
   */
  const saveVideoRef = useCallback((id: string) => (element: HTMLVideoElement | null) => {
    if (element) {
      videoRefsMap.current.set(id, element)
    } else {
      videoRefsMap.current.delete(id)
    }
  }, [])

  /**
   * 获取所有视频元素数组
   * @returns 所有已注册的视频元素数组
   */
  const getAllVideos = useCallback(() => {
    return Array.from(videoRefsMap.current.values())
  }, [])

  /**
   * 获取指定 ID 的视频元素
   * @param id 视频的唯一标识符
   * @returns 对应的视频元素,不存在则返回 undefined
   */
  const getVideo = useCallback((id: string) => {
    return videoRefsMap.current.get(id)
  }, [])

  /**
   * 清除所有视频元素引用
   */
  const clearRefs = useCallback(() => {
    videoRefsMap.current.clear()
  }, [])

  return { saveVideoRef, getAllVideos, getVideo, clearRefs }
}