'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAuth } from '@/lib/hooks'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { addTask, fetchTasksEmail, deleteTask, updateTask } from '@/models/task'
import {
  ActivityIcon,
  BackpackIcon,
  CheckIcon,
  KanbanIcon,
  ListTodoIcon,
  PlusIcon,
  UploadIcon,
  SearchIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  RefreshCw
} from 'lucide-react'
import { Task } from '@/models/task'
import { TaskModal } from '@/components/TaskModal'
import { FileUploadModal } from '@/components/FileUploadModal'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Employee, fetchEmployee } from '@/models/employee'

const columns = [
  { id: 'backlog', title: 'Backlog', icon: BackpackIcon, color: 'bg-gray-100' },
  { id: 'todo', title: 'To Do', icon: ListTodoIcon, color: 'bg-blue-100' },
  { id: 'inProgress', title: 'In Progress', icon: ActivityIcon, color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', icon: CheckIcon, color: 'bg-green-100' },
]

const TaskItem = React.memo(({ task, index, onClick }: { task: Task; index: number; onClick: () => void }) => {
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'backend': return 'bg-purple-200 text-purple-800'
      case 'frontend': return 'bg-pink-200 text-pink-800'
      case 'backend + frontend': return 'bg-indigo-200 text-indigo-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-l-green-500'
      case 'medium': return 'border-l-yellow-500'
      case 'high': return 'border-l-red-500'
      case 'urgent': return 'border-l-red-500'
      case 'critical': return 'border-l-red-500'
      default: return 'border-l-gray-400'
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg p-3 shadow-sm mb-2 cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 ${getPriorityColor(task.priority || 'null')} ${(task.priority === 'urgent' || task.priority === 'critical') ? 'border-r-4 border-r-red-500' : ''}`}
          onClick={onClick}
        >
          <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {task.time}h
            </Badge>
            <Badge variant="secondary" className={`flex items-center gap-1 ${getEffortColor(task.efforts)}`}>
              <TagIcon className="w-3 h-3" />
              {task.efforts}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              {task.assignee}
            </Badge>
          </div>
          <Progress value={task.status === 'done' ? 100 : task.status === 'inProgress' ? 50 : task.status === 'todo' ? 25 : 0} className="h-1" />
        </div>
      )}
    </Draggable>
  )
})

const Column = React.memo(({ id, title, icon: Icon, color, tasks, onTaskClick }: {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) => {
  return (
    <Card className={`w-80 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  )
})

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEffort, setFilterEffort] = useState('all')
  const { user } = useAuth()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()

  const fetchTasksData = useCallback(async () => {
    if (user?.email) {
      try {
        const emp = await fetchEmployee(user.email)
        setEmployee(emp)
        const tasksData = await fetchTasksEmail(user.email, emp.role)
        setTasks(tasksData)
      } catch (error) {
        console.error('Failed to load tasks')
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [user, toast])

  useEffect(() => {
    fetchTasksData()
  }, [fetchTasksData])

  useEffect(() => {
    if (selectedTask) {
      setIsModalOpen(true)
    }
  }, [selectedTask])

  const filteredTasksMemo = useMemo(() => {
    return tasks.filter(task =>
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterEffort === 'all' || task.efforts === filterEffort)
    )
  }, [tasks, searchTerm, filterEffort])

  useEffect(() => {
    setFilteredTasks(filteredTasksMemo)
  }, [filteredTasksMemo])

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    if (user?.email) {
      try {
        const createdTask = await addTask(newTask, user.email)
        setTasks((prevTasks) => [...prevTasks, createdTask])
        setFilteredTasks((prevFilteredTasks) => [...prevFilteredTasks, createdTask]);

        toast({
          title: "Success",
          description: "Task added successfully.",
        })
      } catch (error) {
        console.error('Failed to add task')
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateTask = useCallback(async (taskToUpdate: Task) => {
    if (user?.email) {
      try {
        await updateTask(taskToUpdate, user.email)
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskToUpdate.id ? taskToUpdate : task))
        )
        toast({
          title: "Success",
          description: "Task updated successfully.",
        })
      } catch (error) {
        console.error('Failed to update task')
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      console.error('User email is not available')
      toast({
        title: "Error",
        description: "User information is not available. Please try logging in again.",
        variant: "destructive",
      })
    }
  }, [user, toast])

  const handleDeleteTask = async (taskId: string) => {
    if (user?.email) {
      try {
        await deleteTask(taskId, user.email)
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        })
      } catch (error) {
        console.error('Failed to delete task')
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result

      if (!destination) {
        return
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      setTasks((prevTasks) => {
        const taskIndex = prevTasks.findIndex(task => task.id === draggableId)
        if (taskIndex === -1) return prevTasks

        const movedTask = { ...prevTasks[taskIndex], status: destination.droppableId as Task['status'] }
        const updatedTasks = Array.from(prevTasks)
        updatedTasks.splice(taskIndex, 1)
        updatedTasks.splice(destination.index, 0, movedTask)

        if (source.droppableId !== destination.droppableId) {
          handleUpdateTask(movedTask)
        }

        return updatedTasks
      })
    },
    [handleUpdateTask]
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="h-16 flex items-center justify-between px-6 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <KanbanIcon className="mr-2 h-6 w-6 text-blue-500" />
          Kanban Board
        </h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            className="bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload Tasks
          </Button>
          <Button
            onClick={() => {
              setSelectedTask(null)
              setIsModalOpen(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </header>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterEffort} onValueChange={setFilterEffort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by effort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All efforts</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend + frontend">Backend + Frontend</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchTasksData} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            Total Tasks: {tasks.length}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Filtered Tasks: {filteredTasks.length}
          </Badge>
        </div>
      </div>
      <main className="flex-1 overflow-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-6">
            {columns.map(({ id, title, icon, color }) => (
              <Column
                key={id}
                id={id}
                title={title}
                icon={icon}
                color={color}
                tasks={filteredTasks.filter(task => task.status === id)}
                onTaskClick={(task) => {
                  setSelectedTask(task)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        </DragDropContext>
      </main>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onEdit={() => {
          // This will be called when the edit button is clicked
          // You can add any additional logic here if needed
        }}
        onSave={(task) => {
          if (task.id) {
            handleUpdateTask(task)
          } else {
            handleAddTask(task)
          }
          setIsModalOpen(false)
          setSelectedTask(null)
        }}
        onDelete={handleDeleteTask}
      />
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}