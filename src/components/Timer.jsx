import { useState, useEffect, useRef } from 'react'

const Timer = () => {
  const [timerMode, setTimerMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [sessions, setSessions] = useState([])
  const [timerStatus, setTimerStatus] = useState('Focus Time')
  
  const timerRef = useRef(null)
  const timerStartTimeRef = useRef(null)

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('placeTrackSessions')) || []
    setSessions(savedSessions.slice(0, 10))
  }, [])

  useEffect(() => {
    if (timerMode === 'pomodoro') {
      setTimerStatus(isBreakTime ? 'Break Time' : 'Focus Time')
    } else {
      setTimerStatus('Stopwatch')
    }
  }, [timerMode, isBreakTime])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const updateProgress = () => {
    if (timerMode === 'pomodoro' && !isBreakTime) {
      const totalSeconds = 25 * 60
      return ((totalSeconds - timeLeft) / totalSeconds) * 100
    } else if (timerMode === 'pomodoro' && isBreakTime) {
      const totalSeconds = 5 * 60
      return ((totalSeconds - timeLeft) / totalSeconds) * 100
    }
    return 0
  }

  const saveSession = () => {
    if (!selectedSubject) return
    
    let duration
    if (timerMode === 'pomodoro' && !isBreakTime) {
      duration = 25 * 60 - timeLeft
    } else if (timerMode === 'stopwatch') {
      duration = timeLeft
    } else {
      return
    }

    if (duration < 60) return

    const session = {
      id: Date.now().toString(),
      subject: selectedSubject,
      duration: duration,
      date: new Date().toISOString()
    }

    const savedSessions = JSON.parse(localStorage.getItem('placeTrackSessions')) || []
    savedSessions.push(session)
    localStorage.setItem('placeTrackSessions', JSON.stringify(savedSessions))
    
    setSessions(savedSessions.slice(-10).reverse())
  }

  const startTimer = () => {
    if (!selectedSubject) {
      alert('Please select a subject first')
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    timerStartTimeRef.current = Date.now()

    if (timerMode === 'pomodoro') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 0) {
            return prev - 1
          } else {
            clearInterval(timerRef.current)
            
            if (!isBreakTime) {
              saveSession()
              setIsBreakTime(true)
              setTimeLeft(5 * 60)
              setTimeout(() => startTimer(), 100)
            } else {
              setIsBreakTime(false)
              setTimeLeft(25 * 60)
              setIsRunning(false)
              alert('Pomodoro cycle completed!')
            }
            return prev
          }
        })
      }, 1000)
    } else {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000)
        setTimeLeft(elapsed)
      }, 1000)
    }
  }

  const pauseTimer = () => {
    clearInterval(timerRef.current)
    setIsPaused(true)
  }

  const resetTimer = () => {
    clearInterval(timerRef.current)
    setIsRunning(false)
    setIsPaused(false)
    
    if (timerMode === 'pomodoro') {
      setTimeLeft(25 * 60)
      setIsBreakTime(false)
    } else {
      if (timeLeft > 0) {
        saveSession()
      }
      setTimeLeft(0)
    }
  }

  const switchToPomodoro = () => {
    if (isRunning) resetTimer()
    setTimerMode('pomodoro')
    setTimeLeft(25 * 60)
    setIsBreakTime(false)
  }

  const switchToStopwatch = () => {
    if (isRunning) resetTimer()
    setTimerMode('stopwatch')
    setTimeLeft(0)
  }

  return (
    <section className="content-section">
      <h2 className="text-3xl font-bold mb-6">Focus Timer</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Timer Card */}
        <div className="card p-6 rounded-lg flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subject...</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
              <option value="System Design">System Design</option>
              <option value="Web Development">Web Development</option>
              <option value="Database">Database</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Timer Mode</label>
            <div className="flex space-x-4">
              <button 
                onClick={switchToPomodoro}
                className={`flex-1 py-2 px-4 rounded-md border border-gray-700 ${
                  timerMode === 'pomodoro' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-hourglass-half mr-2"></i> Pomodoro
              </button>
              <button 
                onClick={switchToStopwatch}
                className={`flex-1 py-2 px-4 rounded-md border border-gray-700 ${
                  timerMode === 'stopwatch' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-stopwatch mr-2"></i> Stopwatch
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center mb-8">
            <div className="timer-display mb-2">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-400 mb-4">{timerStatus}</div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${updateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={startTimer}
              disabled={isRunning && !isPaused}
              className="btn-neon px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play mr-2"></i> {isPaused ? 'Resume' : 'Start'}
            </button>
            <button 
              onClick={pauseTimer}
              disabled={!isRunning || isPaused}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-pause mr-2"></i> Pause
            </button>
            <button 
              onClick={resetTimer}
              disabled={!isRunning && !isPaused}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-redo mr-2"></i> Reset
            </button>
          </div>
        </div>

        {/* Session History */}
        <div className="card p-6 rounded-lg flex-1">
          <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
          
          <div className="overflow-y-auto max-h-96">
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No sessions recorded yet</div>
              ) : (
                sessions.map((session) => {
                  const date = new Date(session.date)
                  const hours = Math.floor(session.duration / 60)
                  const minutes = session.duration % 60
                  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                  
                  return (
                    <div key={session.id} className="bg-gray-800 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{session.subject}</span>
                        <span className="text-sm text-gray-400">{date.toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-sm text-gray-300">
                          <i className="fas fa-clock text-blue-400 mr-1"></i> {timeText}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-900 rounded-full">{formatTime(session.duration)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Timer