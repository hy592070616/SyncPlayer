import { ReactNode } from 'react'
import './VideoGrid.css'

interface VideoGridProps {
  children: ReactNode
  gridTemplateColumns?: string
}

function VideoGrid({ children, gridTemplateColumns }: VideoGridProps) {
  return (
    <div
      className="video-grid"
      style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
    >
      {children}
    </div>
  )
}

export default VideoGrid
