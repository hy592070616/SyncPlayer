import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'
import { MultiVideoPlayer } from './components/MultiVideoPlayer'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="app">
        <MultiVideoPlayer />
      </div>
    </ThemeProvider>
  )
}

export default App