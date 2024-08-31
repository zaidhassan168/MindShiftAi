// /types/task.ts
import { toast } from '@/components/ui/use-toast';
type Task = {
    id: string;
    title: string;
    description: string;
    time: number; // in hours
    efforts: 'backend' | 'frontend' | 'backend + frontend';
    assignee: string;
    assigneeId?: string;
    status: 'backlog' | 'todo' | 'inProgress' | 'done';
    createdAt?: Date;
    projectId?: string;
    reporter?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical' | 'null';
    dueDate?: Date;
    comments?: Comment[];
    assigneeEmail?: string;
    reporterEmail?: string;
    projectManagerId?: string;
    name?: string;
    };
    const API_URL = '/api/project-management/tasks';

export const fetchTasks = async (email: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}?email=${email}`);
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

export const addTask = async (task: Omit<Task, 'id'>, email: string): Promise<Task> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to add task');
    }

    const data = await response.json();
    toast({
      title: 'Success',
      description: 'Task added successfully',
    });

    return data;
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

    toast({
      title: 'Success',
      description: 'Task updated successfully',
    });
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
    
    export type { Task };