/**
 * 视频对象接口
 * 表示单个视频文件的所有相关信息
 */
export interface Video {
  /** 唯一标识符,格式: `${path}-${name}-${index}` 用于避免同名文件冲突 */
  id: string;
  
  /** 文件名称,用于显示 */
  name: string;
  
  /** 文件路径,作为React列表渲染的key */
  path: string;
  
  /** File对象,来自input文件选择 */
  file: File;
  
  /** Blob URL,用于video元素的src属性 */
  url: string;
  
  /** 视频宽高比,数值类型(如16/9 = 1.777...) */
  aspectRatio: number;
  
  /** 视频时长(秒) */
  duration: number;
  
  /** 是否已准备播放(canplaythrough事件触发) */
  isReady: boolean;
  
  /** 是否加载失败 */
  hasError: boolean;
}

/**
 * 视频状态接口
 * 管理所有视频的全局播放状态
 */
export interface VideoState {
  /** 所有视频对象数组 */
  videos: Video[];
  
  /** 是否正在播放 */
  isPlaying: boolean;
  
  /** 当前播放时间(秒) */
  currentTime: number;
  
  /** 最大时长(所有视频中最长的时长) */
  duration: number;
  
  /** 主视频ID,用于控制进度条和时间更新事件 */
  masterVideoId: string | null;
}

/**
 * 视频操作接口
 * 定义所有可用的视频控制方法
 */
export interface VideoActions {
  /** 播放所有视频 */
  playAll: () => void;
  
  /** 暂停所有视频 */
  pauseAll: () => void;
  
  /** 切换播放/暂停状态 */
  togglePlayPause: () => void;
  
  /** 所有视频跳转到指定时间 */
  seekAll: (time: number) => void;
  
  /** 前进一帧 */
  frameSkipNext: () => void;
  
  /** 后退一帧 */
  frameSkipPrev: () => void;
}