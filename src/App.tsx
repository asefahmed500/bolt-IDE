import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { importProject } from './utils/exportUtils';
import AuthForm from './components/auth/AuthForm';
import ProjectDashboard from './components/projects/ProjectDashboard';
import IDELayout from './components/ide/IDELayout';
import AnimatedBackground from './components/animations/AnimatedBackground';
import { Project } from './types';

function App() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    projects,
    currentProject,
    createProject,
    updateProject,
    deleteProject,
    openProject,
    setCurrentProject
  } = useProjects(user?.id || '');
  
  const [viewMode, setViewMode] = useState<'dashboard' | 'ide'>('dashboard');

  // GSAP animations
  useEffect(() => {
    // Initial page load animation
    gsap.fromTo('body', 
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );
  }, []);

  // Handle project operations
  useEffect(() => {
    if (currentProject && viewMode === 'dashboard') {
      setViewMode('ide');
    }
  }, [currentProject]);

  const handleCreateProject = (name: string, description?: string) => {
    const newProject = createProject(name, description);
    
    // Animate project creation
    gsap.fromTo('.project-creation-feedback',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    
    setTimeout(() => {
      setViewMode('ide');
    }, 500);
  };

  const handleOpenProject = (project: Project) => {
    openProject(project);
    
    // Smooth transition animation
    gsap.to('.dashboard-content', {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        setViewMode('ide');
      }
    });
  };

  const handleBackToDashboard = () => {
    gsap.to('.ide-content', {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        setCurrentProject(null);
        setViewMode('dashboard');
      }
    });
  };

  const handleImportProject = async (file: File) => {
    try {
      const importedProject = await importProject(file);
      if (importedProject && user) {
        const newProject = { ...importedProject, userId: user.id };
        updateProject(newProject);
        
        // Show success animation
        gsap.fromTo('.import-success',
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' }
        );
        
        setTimeout(() => {
          gsap.to('.import-success', { opacity: 0, y: -100, duration: 0.3 });
        }, 3000);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import project. Please make sure it\'s a valid project file.');
    }
  };

  const handleLogout = () => {
    // Logout animation
    gsap.to('.app-content', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        logout();
        setViewMode('dashboard');
        setCurrentProject(null);
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white"
        >
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <AuthForm onLogin={login} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="app-content relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="dashboard-content"
            >
              <ProjectDashboard
                projects={projects}
                onCreateProject={handleCreateProject}
                onOpenProject={handleOpenProject}
                onDeleteProject={deleteProject}
                onImportProject={handleImportProject}
              />
            </motion.div>
          ) : (
            currentProject && (
              <motion.div
                key="ide"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="ide-content"
              >
                <IDELayout
                  project={currentProject}
                  onBack={handleBackToDashboard}
                  onLogout={handleLogout}
                  userName={user?.username || 'User'}
                  userId={user?.id || ''}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Success/Error Notifications */}
      <div className="project-creation-feedback fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 z-50">
        🎉 Project created successfully!
      </div>
      
      <div className="import-success fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 z-50">
        📦 Project imported successfully!
      </div>
    </div>
  );
}

export default App;