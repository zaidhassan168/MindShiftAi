// /types/task.ts
import { toast } from '@/components/ui/use-toast';
import { Employee } from './employee';
import { Stage } from './stage';
import { EmployeeSummary } from './summaries';
import {taskUpdateNotification} from '@/utils/ayncfunctions/pushNotification'
type Reactions = {
  [emoji: string]: string[]
}

type Comment = {
  id: string
  content: string
  author: string
  createdAt: Date
  taskId: string
  reactions: Reactions
  mentions?: string[]
}

type Dependencies = {
  taskIds: string[]
}

    type Task = {
      id: string;
      title: string;
      description: string;
      time: number; // in hours
      efforts: 'backend' | 'frontend' | 'backend + frontend';
      assignee: EmployeeSummary | null,
      status: 'backlog' | 'todo' | 'inProgress' | 'done';
      createdAt?: Date;
      projectId?: string;
      stageId?: string;  // Associated stage
      priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical' | 'null';
      dueDate?: Date;
      comments?: Comment[];
      reporter?: EmployeeSummary
      type: 'bug' | 'feature' | 'documentation' | 'task' | 'changeRequest' | 'other';
      lastUpdated?: Date;
      completedAt?: Date | null;
      complexity?: 'simple' | 'moderate' | 'complex';
      qualityRating?: number;
      startDate?: Date;
      dependencies?: Dependencies;
      order?: number

    };
    
    const API_URL = '/api/project-management/tasks';

export const fetchTasksEmail = async (email: string, role: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/${email}?role=${role}`);
    if (!response.ok) {  
      const errorMessage = response.status === 404  
        ? 'No tasks found'  
        : 'Failed to fetch tasks';  
      throw new Error(errorMessage);  
    }  
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch tasks',
      variant: 'destructive',
    });
    throw error;
  }
};
export const fetchTasksAll = async (): Promise<Task[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch tasks',
      variant: 'destructive',
    });
    throw error;
  }
};
export const  addTask = async (task: Omit<Task, 'id'>, email: string): Promise<Task> => {
  console.log('Adding task:', task);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, email }), // Pass the task and email as is
    });
    console.log('Response status:', response);
    if (!response.ok) {
      throw new Error('Failed to add task');
    }

    const data = await response.json();
    toast({
      title: 'Success',
      description: 'Task added successfully',
    });

    return data; // The data will contain the new task ID generated by Firestore
  } catch (error) {
    console.error('Error adding task:', error);
    toast({
      title: 'Error',
      description: 'Failed to add task',
      variant: 'destructive',
    });
    throw error;
  }
};


export const updateTask = async (task: Task, email: string): Promise<void> => {
  console.log('Updating task:', task);
  try {
    const response = await fetch(API_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    taskUpdateNotification(task);
  } catch (error) {
    console.error('Error updating task:', error);
    toast({
      title: 'Error',
      description: 'Failed to update task',
      variant: 'destructive',
    });
    throw error;
  }
};


// /models/task.ts

export const updateTaskComments = async (taskId: string, comments: Comment[] , email: string): Promise<void> => {
  console.log('Updating task comments:', taskId, comments);
  try {
    const response = await fetch('/api/project-management/tasks/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, comments, email }),
    });

    if (!response.ok) {
      
      throw new Error('Failed to update task comments');
    }

    const data = await response.json();
    toast({
      title: 'Success',
      description: 'Added Comment successfully',
    });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update task comments');
    }

  } catch (error) {
    console.error('Error updating task comments:', error);
    toast({
      title: 'Error',
      description: 'Failed to update task comments',
      variant: 'destructive',
    });
    throw error;
  }
};

export const deleteTask = async (id: string, email: string): Promise<void> => {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    toast({
      title: 'Success',
      description: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete task',
      variant: 'destructive',
    });
    throw error;
  }
};
    
export const fetchTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await fetch(
      `${API_URL}/byProject?projectId=${projectId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {  
        const errorMessage = response.status === 404  
          ? 'No tasks found'  
          : 'Failed to fetch tasks';  
        throw new Error(errorMessage);  
      }  
      return await response.json();
    }catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',})
        throw error;
      }
    }


    export type { Task, Comment, Reactions };