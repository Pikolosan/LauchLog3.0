const Sidebar = ({ activeSection, setActiveSection }) => {
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.removeItem('placeTrackSessions')
      localStorage.removeItem('placeTrackTasks')
      localStorage.removeItem('placeTrackJobs')
      window.location.reload()
    }
  }

  return (
    <aside className="sidebar w-64 h-screen fixed top-0 left-0 overflow-y-auto">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 neon-text">LaunchLog</h1>
          <p className="text-sm text-gray-400">Like a launchpad for your career, logs all progress.</p>
        </div>
        
        <nav className="space-y-2 flex-grow">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`nav-link flex items-center p-3 rounded-lg w-full text-left ${
              activeSection === 'dashboard' ? 'active-nav' : 'hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-chart-line mr-3 w-5"></i>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection('timer')}
            className={`nav-link flex items-center p-3 rounded-lg w-full text-left ${
              activeSection === 'timer' ? 'active-nav' : 'hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-clock mr-3 w-5"></i>
            <span>Timer</span>
          </button>
          <button
            onClick={() => setActiveSection('plan')}
            className={`nav-link flex items-center p-3 rounded-lg w-full text-left ${
              activeSection === 'plan' ? 'active-nav' : 'hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-tasks mr-3 w-5"></i>
            <span>Plan</span>
          </button>
          <button
            onClick={() => setActiveSection('jobs')}
            className={`nav-link flex items-center p-3 rounded-lg w-full text-left ${
              activeSection === 'jobs' ? 'active-nav' : 'hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-briefcase mr-3 w-5"></i>
            <span>Jobs Tracker</span>
          </button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button 
            onClick={handleResetData}
            className="flex items-center p-3 text-red-400 hover:text-red-300 w-full text-left"
          >
            <i className="fas fa-trash-alt mr-3"></i>
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar