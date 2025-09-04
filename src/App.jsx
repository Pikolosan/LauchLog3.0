import { useState } from 'react'
import { useData } from './hooks/useData'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Timer from './components/Timer'
import Plan from './components/Plan'
import Jobs from './components/Jobs'
import Cover from './components/Cover'

function App() {
  const [showCover, setShowCover] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const dataHook = useData()

  const handleEnterApp = () => {
    setShowCover(false)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'timer':
        return <Timer dataHook={dataHook} />
      case 'plan':
        return <Plan dataHook={dataHook} />
      case 'jobs':
        return <Jobs dataHook={dataHook} />
      default:
        return <Dashboard dataHook={dataHook} />
    }
  }

  if (showCover) {
    return <Cover onEnter={handleEnterApp} />
  }

  return (
    <div className="flex h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} dataHook={dataHook} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {dataHook.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-sky-blue mb-4 mx-auto"></div>
              <p className="text-secondary-text">Loading your data...</p>
            </div>
          </div>
        ) : (
          renderActiveSection()
        )}
      </main>
    </div>
  )
}

export default App