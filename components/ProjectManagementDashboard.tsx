'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, BarChart2, CheckCircle2, Users, AlertCircle } from "lucide-react"
import { useAuth } from '@/lib/hooks'
import { fetchTasks } from '@/models/task'
import { fetchProjects } from '@/models/project'
import { fetchEmployees } from '@/models/employee'
import { fetchRisks } from '@/models/risk'
import { Task } from '@/models/task'
import { Project } from '@/models/project'
import { Employee } from '@/models/employee'
import { Risk } from '@/models/risk'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Tooltip, TooltipProvider } from './ui/tooltip'
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function ProjectManagementDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        try {
          const [tasksData, projectsData, employeesData, risksData] = await Promise.all([
            fetchTasks(user.email),
            fetchProjects(),
            fetchEmployees(),
            fetchRisks()
          ])
          setTasks(tasksData)
          setProjects(projectsData)
          setEmployees(employeesData)
          setRisks(risksData)
        } catch (error) {
          console.error('Error loading data:', error)
        }
      }
    }

    loadData()
  }, [user])

  const getProjectTasks = (projectId: string) =>
    tasks.filter((task) => task.projectId === projectId)

  const getProjectRisks = (projectId: string) =>
    risks.filter((risk) => risk.projectId === projectId)

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    const completedTasks = projectTasks.filter((task) => task.status === 'done').length
    return projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'text-green-600'
      case 'inProgress': return 'text-yellow-600'
      case 'todo': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityColor = (severity: Risk['severity']) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 75) return 'text-green-600'
    if (availability >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrackStatusColor = (onTrack: boolean) => {
    return onTrack ? 'text-green-600' : 'text-red-600'
  }

  const projectStatusData = [
    { name: 'On Track', value: projects.filter(p => p.onTrack).length },
    { name: 'Off Track', value: projects.filter(p => !p.onTrack).length },
  ]

  const taskStatusData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'inProgress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ]

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Project Management Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter(p => p.onTrack).length} on track
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              {employees.filter(e => e.availability && e.availability > 50).length} available            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risks.length}</div>
            <p className="text-xs text-muted-foreground">
              {risks.filter(r => r.severity === 'High').length} high severity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'done').length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ceo-overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ceo-overview">CEO Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects Overview</TabsTrigger>
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="resources">Resource Management</TabsTrigger>
        </TabsList>
        <TabsContent value="ceo-overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <TooltipProvider><Tooltip /></TooltipProvider>
                      
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Task Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <TooltipProvider><Tooltip /></TooltipProvider>                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Risks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Progress value={getProjectProgress(project.id)} className="w-[60%]" />
                          <span className="ml-2">{getProjectProgress(project.id)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProjectTasks(project.id).filter(task => task.status === 'done').length} / {getProjectTasks(project.id).length} completed
                      </TableCell>
                      <TableCell>{getProjectRisks(project.id).length} identified</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${getTrackStatusColor(project.onTrack)}`}>
                          {project.onTrack ? (
                            <>
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              On Track
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Off Track
                            </>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk Register</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Risk Description</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.flatMap((project) =>
                    getProjectRisks(project.id).map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{risk.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                            {risk.severity}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Current Project</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.currentProject}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getAvailabilityColor(employee.availability ?? 0)}`}>
                          {employee.availability ?? 0}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
