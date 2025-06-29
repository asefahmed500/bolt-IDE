import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  MoreVertical, 
  Play, 
  Trash2, 
  Download,
  Edit3,
  Clock
} from 'lucide-react';
import { Project } from '../../types';
import { exportProject } from '../../utils/exportUtils';
import { getFileIcon } from '../../utils/fileUtils';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  viewMode: 'grid' | 'list';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onOpen, 
  onDelete, 
  viewMode 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
      await exportProject(project);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete();
    }
    setShowMenu(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
              <FileText className="h-6 w-6 text-cyan-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">{project.name}</h3>
              {project.description && (
                <p className="text-gray-400 text-sm mt-1">{project.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Modified {formatDate(project.lastModified)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{project.files.length} files</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {project.files.slice(0, 3).map((file, index) => (
                <span key={index} className="text-sm">
                  {getFileIcon(file.type)}
                </span>
              ))}
              {project.files.length > 3 && (
                <span className="text-xs text-gray-400">+{project.files.length - 3}</span>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10 min-w-[120px]">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-2"
                  >
                    <Download className="h-3 w-3" />
                    <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 flex items-center space-x-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
          <FileText className="h-6 w-6 text-cyan-400" />
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10 min-w-[120px]">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-2"
              >
                <Download className="h-3 w-3" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 flex items-center space-x-2"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="font-semibold text-white text-lg mb-2 truncate">{project.name}</h3>
      
      {project.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="h-3 w-3" />
          <span>{project.files.length} files</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {project.files.slice(0, 4).map((file, index) => (
            <span key={index} className="text-sm" title={file.name}>
              {getFileIcon(file.type)}
            </span>
          ))}
          {project.files.length > 4 && (
            <span className="text-xs text-gray-400">+{project.files.length - 4}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4" />
          <span className="text-sm font-medium">Open</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;