import { useRef, useCallback } from 'react'
import type { Video } from '../types'
import './FileSelector.css'

/**
 * FileSelector 组件属性接口
 */
export interface FileSelectorProps {
  /** 文件选择回调 */
  onSelectFiles: (videos: Video[]) => void
  /** 已有视频数量（用于追加模式） */
  existingCount?: number
  /** 重置视频回调 */
  onReset?: () => void
}

/**
 * 创建 Video 对象
 * @param file 文件对象
 * @param index 索引
 * @returns Video 对象
 */
export function createVideoObject(file: File, index: number): Video {
  const url = URL.createObjectURL(file)
  // 优先使用 webkitRelativePath（文件夹选择），
  // 其次使用 file.path（Chrome 非标准属性，单个文件选择时返回完整路径），
  // 最后使用 file.name 作为兜底
  const rawPath = file.webkitRelativePath || (file as File & { path?: string }).path || file.name
  const nameWithoutExt = file.name.includes('.')
    ? file.name.substring(0, file.name.lastIndexOf('.'))
    : file.name

  return {
    id: `${rawPath}-${file.name}-${index}`,
    name: nameWithoutExt,
    path: rawPath,
    file,
    url,
    aspectRatio: 16 / 9,
    duration: 0,
    isReady: false,
    hasError: false,
  }
}

/**
 * FileSelector 组件
 * 提供视频文件选择功能，支持追加模式
 */
export function FileSelector({ onSelectFiles, existingCount = 0, onReset }: FileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理文件选择
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      // 创建 Video 对象数组
      const videos: Video[] = []
      for (let i = 0; i < files.length; i++) {
        videos.push(createVideoObject(files[i], existingCount + i))
      }

      onSelectFiles(videos)

      // 重置 input value，允许选择相同文件
      e.target.value = ''
    },
    [onSelectFiles, existingCount]
  )

  /**
   * 触发文件选择
   */
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /**
   * 触发文件夹选择
   */
  const handleFolderClick = useCallback(() => {
    const folderInput = document.createElement('input')
    folderInput.type = 'file'
    folderInput.setAttribute('webkitdirectory', '')
    folderInput.setAttribute('directory', '')
    folderInput.accept = 'video/*'
    folderInput.multiple = true
    folderInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (!files || files.length === 0) return

      const videos: Video[] = []
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('video/')) {
          videos.push(createVideoObject(files[i], existingCount + videos.length))
        }
      }

      if (videos.length > 0) {
        onSelectFiles(videos)
      }
    }
    folderInput.click()
  }, [onSelectFiles, existingCount])

  return (
    <div className="file-selector">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        className="file-selector-input"
        aria-label="选择视频文件"
      />

      {/* 选择/添加视频按钮 */}
      <button
        className="file-selector-button"
        onClick={handleClick}
        aria-label={existingCount > 0 ? '添加更多视频' : '选择视频'}
      >
        {existingCount > 0 ? '添加更多视频' : '选择视频'}
      </button>

      {/* 选择文件夹按钮 */}
      <button
        className="file-selector-button"
        onClick={handleFolderClick}
        aria-label="选择视频文件夹"
      >
        选择文件夹
      </button>

      {/* 重置视频按钮 */}
      {existingCount > 0 && onReset && (
        <button
          className="file-selector-button file-selector-button--reset"
          onClick={onReset}
          aria-label="重置视频"
        >
          重置视频
        </button>
      )}
    </div>
  )
}