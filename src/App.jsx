import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Timer from './components/Timer'
import Plan from './components/Plan'
import Jobs from './components/Jobs'
import Cover from './components/Cover'

function App() {
  const [showCover, setShowCover] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  const handleEnterApp = () => {
    setShowCover(false)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'timer':
        return <Timer />
      case 'plan':
        return <Plan />
      case 'jobs':
        return <Jobs />
      default:
        return <Dashboard />
    }
  }

  if (showCover) {
    return <Cover onEnter={handleEnterApp} />
  }

  return (
    <div className="flex h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {renderActiveSection()}
      </main>
    </div>
  )
}

export default App