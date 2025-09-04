import { useState, useEffect } from 'react'
import { useData } from './hooks/useData'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Timer from './components/Timer'
import Plan from './components/Plan'
import Jobs from './components/Jobs'
import Cover from './components/Cover'
import Auth from './components/Auth'

function App() {
  const [showCover, setShowCover] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const dataHook = useData()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleEnterApp = () => {
    setShowCover(false)
  }

  const handleAuthSuccess = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowCover(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setShowCover(true)
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

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  if (showCover) {
    return <Cover onEnter={handleEnterApp} />
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        dataHook={dataHook}
        user={user}
        onLogout={handleLogout}
      />
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