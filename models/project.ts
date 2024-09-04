//models\project.ts

import { Stage } from './stage';
  
  type Project = {  
    id: string  
    name: string  
    manager: string  
    stages?: Stage[]  
    currentStage?: Stage  
    onTrack?: boolean  
    tasks?: string[] // Consider changing to Task[] if you have a Task type  
  } 

  const API_URL = '/api/project-management/projects';

  export async function fetchProjects(): Promise<Project[]> {  
    const response = await fetch(API_URL);  
    if (!response.ok) {  
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);  
    }  
    return response.json();  
  }  

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
    // add the id in the prject 
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
}

export async function updateProject(project: Project): Promise<Project> {
    const response = await fetch(`${API_URL}/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
}

export async function deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
}
  export type { Project, Stage }