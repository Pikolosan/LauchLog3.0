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
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 welcome-gradient">LaunchLog</h1>
          <p className="text-sm text-secondary leading-relaxed">Like a launchpad for your career, logs all progress.</p>
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
        
        <div className="mt-auto pt-6 border-t border-divider-lines">
          <button 
            onClick={handleResetData}
            className="flex items-center p-3 text-danger hover:text-soft-coral-red w-full text-left rounded-lg transition-all hover:bg-elevated-bg"
          >
            <i className="fas fa-trash-alt mr-3 text-lg"></i>
            <span className="font-medium">Reset All Data</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar