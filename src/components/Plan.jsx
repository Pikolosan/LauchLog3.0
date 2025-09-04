import { useState, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

const Plan = () => {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], completed: [] })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '' })
  
  const todoRef = useRef(null)
  const progressRef = useRef(null)
  const completedRef = useRef(null)
  const sortablesRef = useRef([])

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      initSortable()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      sortablesRef.current.forEach(sortable => {
        try {
          sortable.destroy()
        } catch (e) {
        }
      })
      sortablesRef.current = []
    }
  }, [])

  const loadTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('placeTrackTasks')) || { todo: [], inProgress: [], completed: [] }
    setTasks(savedTasks)
  }

  const saveTasks = (newTasks) => {
    localStorage.setItem('placeTrackTasks', JSON.stringify(newTasks))
    setTasks(newTasks)
  }

  const initSortable = () => {
    sortablesRef.current.forEach(sortable => {
      try {
        sortable.destroy()
      } catch (e) {
      }
    })
    sortablesRef.current = []

    const containers = [
      { ref: todoRef, column: 'todo' },
      { ref: progressRef, column: 'inProgress' },
      { ref: completedRef, column: 'completed' }
    ]

    containers.forEach(({ ref, column }) => {
      if (ref.current) {
        const sortable = new Sortable(ref.current, {
          group: 'tasks',
          animation: 150,
          ghostClass: 'bg-gray-700',
          forceFallback: true,
          fallbackClass: 'bg-gray-600',
          onStart: (evt) => {
            evt.item.style.display = 'none'
          },
          onEnd: (evt) => {
            evt.item.style.display = ''
            
            const taskId = evt.item.getAttribute('data-id')
            const fromColumn = getColumnFromElement(evt.from)
            const toColumn = getColumnFromElement(evt.to)
            
            setTimeout(() => {
              if (fromColumn !== toColumn && taskId) {
                moveTask(taskId, fromColumn, toColumn)
              }
            }, 10)
          }
        })
        sortablesRef.current.push(sortable)
      }
    })
  }

  const getColumnFromElement = (element) => {
    if (element === todoRef.current) return 'todo'
    if (element === progressRef.current) return 'inProgress'
    if (element === completedRef.current) return 'completed'
    return 'todo'
  }

  const moveTask = (taskId, fromColumn, toColumn) => {
    setTasks(currentTasks => {
      const newTasks = { ...currentTasks }
      const taskIndex = newTasks[fromColumn].findIndex(task => task.id === taskId)
      
      if (taskIndex !== -1) {
        const task = newTasks[fromColumn][taskIndex]
        newTasks[fromColumn].splice(taskIndex, 1)
        newTasks[toColumn].push(task)

        localStorage.setItem('placeTrackTasks', JSON.stringify(newTasks))
        return newTasks
      }
      return currentTasks
    })
  }

  const addTask = (e) => {
    e.preventDefault()
    
    if (!taskForm.title) return
    
    const task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description || '',
      dueDate: taskForm.dueDate || '',
      createdAt: new Date().toISOString()
    }
    
    const newTasks = { ...tasks }
    newTasks.todo.push(task)
    saveTasks(newTasks)
    
    setTaskForm({ title: '', description: '', dueDate: '' })
  }

  const deleteTask = (taskId) => {
    const newTasks = { ...tasks }
    for (const column of ['todo', 'inProgress', 'completed']) {
      const index = newTasks[column].findIndex(task => task.id === taskId)
      if (index !== -1) {
        newTasks[column].splice(index, 1)
        saveTasks(newTasks)
        break
      }
    }
  }

  const renderTask = (task) => {
    let dueDateDisplay = null
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const isPast = dueDate < today
      const isToday = dueDate.toDateString() === today.toDateString()
      
      let dateClass = ''
      if (isPast) dateClass = 'text-red-400'
      else if (isToday) dateClass = 'text-yellow-400'
      
      dueDateDisplay = (
        <div className={`flex items-center ${dateClass} text-xs mt-2`}>
          <i className="fas fa-calendar-alt mr-1"></i>
          <span>Due: {dueDate.toLocaleDateString()}</span>
        </div>
      )
    }
    
    return (
      <div key={task.id} className="task-card bg-gray-800 p-3 rounded-md" data-id={task.id}>
        <div className="flex justify-between items-start">
          <h4 className="font-medium">{task.title}</h4>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
            className="text-gray-500 hover:text-red-400 p-1"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        {task.description && (
          <p className="text-sm text-gray-400 mt-1">{task.description}</p>
        )}
        {dueDateDisplay}
      </div>
    )
  }

  return (
    <section className="content-section">
      <h2 className="text-3xl font-bold mb-6">Task Planner</h2>
      
      {/* Add New Task Form */}
      <div className="card p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
        
        <form onSubmit={addTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input 
                type="text" 
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Task title" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
              <input 
                type="date" 
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea 
              rows="2" 
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Task description"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="btn-neon px-6 py-2 rounded-lg">
              <i className="fas fa-plus mr-2"></i> Add Task
            </button>
          </div>
        </form>
      </div>
      
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="kanban-column p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <i className="fas fa-list-ul mr-2 text-blue-400"></i>
            To Do
            <span className="ml-2 text-sm bg-gray-800 px-2 py-1 rounded-full">{tasks.todo.length}</span>
          </h3>
          
          <div ref={todoRef} className="space-y-3 min-h-[200px]">
            {tasks.todo.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tasks here</div>
            ) : (
              tasks.todo.map(renderTask)
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div className="kanban-column p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <i className="fas fa-spinner mr-2 text-yellow-400"></i>
            In Progress
            <span className="ml-2 text-sm bg-gray-800 px-2 py-1 rounded-full">{tasks.inProgress.length}</span>
          </h3>
          
          <div ref={progressRef} className="space-y-3 min-h-[200px]">
            {tasks.inProgress.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tasks here</div>
            ) : (
              tasks.inProgress.map(renderTask)
            )}
          </div>
        </div>
        
        {/* Completed Column */}
        <div className="kanban-column p-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <i className="fas fa-check-circle mr-2 text-green-400"></i>
            Completed
            <span className="ml-2 text-sm bg-gray-800 px-2 py-1 rounded-full">{tasks.completed.length}</span>
          </h3>
          
          <div ref={completedRef} className="space-y-3 min-h-[200px]">
            {tasks.completed.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tasks here</div>
            ) : (
              tasks.completed.map(renderTask)
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Plan