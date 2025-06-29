import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { Project, ProjectFile } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import { createNewFile } from '../../utils/fileUtils';
import { getTemplate } from '../../utils/codeTemplates';
import { exportProject } from '../../utils/exportUtils';
import MenuBar from './MenuBar';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';

interface IDELayoutProps {
  project: Project;
  onBack: () => void;
  onLogout: () => void;
  userName: string;
  userId: string;
}

const IDELayout: React.FC<IDELayoutProps> = ({
  project: initialProject,
  onBack,
  onLogout,
  userName,
  userId
}) => {
  const { updateProject } = useProjects(userId);
  const [project, setProject] = useState(initialProject);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(
    project.files.find(f => f.type === 'html') || project.files[0] || null
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      updateProject(project);
    }, 5000); // Auto-save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [project, updateProject]);

  // GSAP animations for panel transitions
  useEffect(() => {
    gsap.fromTo('.ide-panel', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const handleFileContentChange = (content: string) => {
    if (!activeFile) return;

    const updatedFile = { ...activeFile, content, lastModified: new Date() };
    const updatedFiles = project.files.map(f => 
      f.id === activeFile.id ? updatedFile : f
    );
    
    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);
    setActiveFile(updatedFile);
  };

  const handleCreateFile = (name: string, type: 'html' | 'css' | 'js') => {
    const newFile = createNewFile(name, type);
    newFile.content = getTemplate(type);
    
    const updatedProject = {
      ...project,
      files: [...project.files, newFile]
    };
    
    setProject(updatedProject);
    setActiveFile(newFile);
    updateProject(updatedProject);
  };

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = project.files.filter(f => f.id !== fileId);
    const updatedProject = { ...project, files: updatedFiles };
    
    setProject(updatedProject);
    
    if (activeFile?.id === fileId) {
      setActiveFile(updatedFiles[0] || null);
    }
    
    updateProject(updatedProject);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    const updatedFiles = project.files.map(f => 
      f.id === fileId ? { ...f, name: newName, lastModified: new Date() } : f
    );
    
    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);
    updateProject(updatedProject);
  };

  const handleSaveProject = () => {
    updateProject(project);
    
    // Show save feedback
    gsap.fromTo('.save-feedback',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
    
    setTimeout(() => {
      gsap.to('.save-feedback', { opacity: 0, duration: 0.2 });
    }, 2000);
  };

  const handleExportProject = async () => {
    try {
      await exportProject(project);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
    
    // Animate panel transitions
    gsap.to('.editor-panel', {
      width: !isPreviewVisible ? '100%' : `calc(100% - ${rightPanelWidth}px)`,
      duration: 0.3,
      ease: 'power2.inOut'
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Menu Bar */}
      <MenuBar
        projectName={project.name}
        onSave={handleSaveProject}
        onExport={handleExportProject}
        onLogout={onLogout}
        userName={userName}
        isPreviewVisible={isPreviewVisible}
        onTogglePreview={togglePreview}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main IDE Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Back Button - Mobile */}
        <div className="absolute top-14 left-4 z-20 md:hidden">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Left Panel - File Explorer */}
        <motion.div
          className="ide-panel w-80 md:w-64 lg:w-80 flex-shrink-0 hidden md:block"
          style={{ width: leftPanelWidth }}
        >
          <FileExplorer
            files={project.files}
            activeFileId={activeFile?.id || null}
            onSelectFile={setActiveFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />
        </motion.div>

        {/* Center Panel - Code Editor */}
        <motion.div
          className="ide-panel editor-panel flex-1 min-w-0"
        >
          <CodeEditor
            file={activeFile}
            onChange={handleFileContentChange}
            className="h-full"
          />
        </motion.div>

        {/* Right Panel - Live Preview */}
        {isPreviewVisible && (
          <motion.div
            className="ide-panel w-96 md:w-80 lg:w-96 flex-shrink-0 hidden md:block"
            style={{ width: rightPanelWidth }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <LivePreview
              files={project.files}
              className="h-full"
            />
          </motion.div>
        )}
      </div>

      {/* Mobile Preview Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePreview}
          className={`p-4 rounded-full shadow-lg transition-all ${
            isPreviewVisible 
              ? 'bg-cyan-500 text-white' 
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          {isPreviewVisible ? '📱' : '💻'}
        </motion.button>
      </div>

      {/* Save Feedback */}
      <div className="save-feedback fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 z-50">
        ✅ Project Saved
      </div>

      {/* Mobile File Explorer Overlay */}
      <div className="md:hidden">
        {/* Mobile preview overlay when active */}
        {isPreviewVisible && (
          <motion.div
            className="fixed inset-0 bg-gray-900 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="font-medium">Live Preview</h3>
                <button
                  onClick={() => setIsPreviewVisible(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <LivePreview files={project.files} className="h-full" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IDELayout;