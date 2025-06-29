import { useState, useEffect } from 'react';
import { Project, ProjectFile } from '../types';
import { getTemplate } from '../utils/codeTemplates';

export const useProjects = (userId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = () => {
    try {
      const savedProjects = localStorage.getItem(`projects_${userId}`);
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        
        // Load the last opened project
        const lastProjectId = localStorage.getItem(`lastProject_${userId}`);
        if (lastProjectId) {
          const lastProject = parsedProjects.find((p: Project) => p.id === lastProjectId);
          if (lastProject) {
            setCurrentProject(lastProject);
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const saveProjects = (updatedProjects: Project[]) => {
    try {
      localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const createProject = (name: string, description?: string): Project => {
    const defaultFiles: ProjectFile[] = [
      {
        id: `file_${Date.now()}_1`,
        name: 'index.html',
        content: getTemplate('html'),
        type: 'html',
        lastModified: new Date()
      },
      {
        id: `file_${Date.now()}_2`,
        name: 'style.css',
        content: getTemplate('css'),
        type: 'css',
        lastModified: new Date()
      },
      {
        id: `file_${Date.now()}_3`,
        name: 'script.js',
        content: getTemplate('js'),
        type: 'js',
        lastModified: new Date()
      }
    ];

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      files: defaultFiles,
      createdAt: new Date(),
      lastModified: new Date(),
      userId
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setCurrentProject(newProject);
    localStorage.setItem(`lastProject_${userId}`, newProject.id);

    return newProject;
  };

  const updateProject = (updatedProject: Project) => {
    updatedProject.lastModified = new Date();
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(updatedProjects);
    setCurrentProject(updatedProject);
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      localStorage.removeItem(`lastProject_${userId}`);
    }
  };

  const openProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem(`lastProject_${userId}`, project.id);
  };

  return {
    projects,
    currentProject,
    createProject,
    updateProject,
    deleteProject,
    openProject,
    setCurrentProject
  };
};