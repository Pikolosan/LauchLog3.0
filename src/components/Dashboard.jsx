import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTimeFocused: '0 hours',
    daysFocused: '0 days',
    bestDay: '0 hours',
    bestDayDate: 'Not enough data',
    currentStreak: '0 days',
    maxStreak: '0',
    bestWeek: '0 hours',
    bestWeekDate: 'Not enough data',
    bestMonth: '0 hours',
    bestMonthDate: 'Not enough data',
    jobsAppliedCount: '0 applications',
    interviewCount: '0'
  })

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('placeTrackSessions')) || []
    const jobs = JSON.parse(localStorage.getItem('placeTrackJobs')) || []
    const totalMinutes = sessions.reduce((total, session) => total + (session.duration || 0), 0)
    const totalHours = Math.floor(totalMinutes / 60)
    const uniqueDays = new Set(sessions.map(session => session.date?.split('T')[0])).size
    const interviews = jobs.filter(job => job.status === 'Interview').length

    setStats(prev => ({
      ...prev,
      totalTimeFocused: `${totalHours} hours`,
      daysFocused: `${uniqueDays} days`,
      jobsAppliedCount: `${jobs.length} applications`,
      interviewCount: interviews.toString()
    }))
  }, [])

  const renderSubjectChart = () => {
    const sessions = JSON.parse(localStorage.getItem('placeTrackSessions')) || []
    
    if (sessions.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No focus sessions recorded yet
        </div>
      )
    }

    const subjectTotals = {}
    sessions.forEach(session => {
      if (session.subject && session.duration) {
        subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + session.duration
      }
    })

    const subjects = Object.keys(subjectTotals)
    const hoursData = Object.values(subjectTotals).map(m => (m / 60).toFixed(1))

    const colors = [
      'rgba(0, 243, 255, 0.7)',
      'rgba(157, 78, 221, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ]

    const data = {
      labels: subjects,
      datasets: [{
        data: hoursData,
        backgroundColor: colors,
        borderColor: 'rgba(30, 30, 30, 0.8)',
        borderWidth: 1
      }]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#f0f0f0',
            padding: 10,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} hours`
            }
          }
        }
      },
      cutout: '60%'
    }

    return <Doughnut data={data} options={options} />
  }

  const renderActivityHeatmap = () => {
    const sessions = JSON.parse(localStorage.getItem('placeTrackSessions')) || []
    
    const dayTotals = {}
    sessions.forEach(session => {
      if (session.date) {
        const day = session.date.split('T')[0]
        dayTotals[day] = (dayTotals[day] || 0) + (session.duration || 0)
      }
    })

    const days = []
    const today = new Date()
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }

    return days.map((day, index) => {
      const minutes = dayTotals[day] || 0
      let intensity = 0
      
      if (minutes > 0) {
        if (minutes < 30) intensity = 1
        else if (minutes < 60) intensity = 2
        else if (minutes < 120) intensity = 3
        else intensity = 4
      }
      
      const intensityClasses = {
        0: 'bg-gray-800',
        1: 'bg-blue-900',
        2: 'bg-blue-700', 
        3: 'bg-blue-500',
        4: 'bg-blue-300'
      }
      
      return (
        <div
          key={day}
          className={`w-4 h-4 rounded-sm ${intensityClasses[intensity]}`}
          title={`${new Date(day).toLocaleDateString()}: ${(minutes / 60).toFixed(1)} hours`}
        />
      )
    })
  }

  return (
    <section className="content-section">
      <h2 className="text-3xl font-bold mb-6 welcome-gradient">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Total Time Focused</h3>
          <p className="text-2xl font-bold">{stats.totalTimeFocused}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-arrow-up text-green-400"></i>
            <span>Since you started tracking</span>
          </div>
        </div>

        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Days Focused</h3>
          <p className="text-2xl font-bold">{stats.daysFocused}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-calendar-alt"></i>
            <span>Total days with activity</span>
          </div>
        </div>

        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Best Day</h3>
          <p className="text-2xl font-bold">{stats.bestDay}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-trophy text-yellow-400"></i>
            <span>{stats.bestDayDate}</span>
          </div>
        </div>

        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Current Streak</h3>
          <p className="text-2xl font-bold">{stats.currentStreak}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-fire text-orange-400"></i>
            <span>Max: {stats.maxStreak} days</span>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Best Week</h3>
          <p className="text-2xl font-bold">{stats.bestWeek}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-calendar-week text-blue-400"></i>
            <span>{stats.bestWeekDate}</span>
          </div>
        </div>

        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Best Month</h3>
          <p className="text-2xl font-bold">{stats.bestMonth}</p>
          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-calendar-alt text-purple-400"></i>
            <span>{stats.bestMonthDate}</span>
          </div>
        </div>

        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-1">Jobs Applied</h3>
          <p className="text-2xl font-bold">{stats.jobsAppliedCount}</p>
          <div className="mt-2 text-xs text-gray-500">
            <span>{stats.interviewCount}</span> interviews scheduled
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Subject Distribution Pie Chart */}
        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-3">Time Distribution by Subject</h3>
          <div className="h-64">
            {renderSubjectChart()}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="card p-5 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-3">Focus Activity Heatmap</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="grid grid-cols-7 gap-1">
              {renderActivityHeatmap()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard