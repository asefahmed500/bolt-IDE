import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  User, 
  LogOut,
  Code2,
  Play,
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface MenuBarProps {
  projectName: string;
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onLogout?: () => void;
  onRunProject?: () => void;
  onTogglePreview?: () => void;
  userName: string;
  isPreviewVisible: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  projectName,
  onSave,
  onExport,
  onImport,
  onLogout,
  onRunProject,
  onTogglePreview,
  userName,
  isPreviewVisible,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  return (
    <div className="h-12 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between px-4">
      {/* Left Section - Logo and Project Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">Real-Time IDE</span>
        </div>
        
        <div className="h-4 w-px bg-gray-600"></div>
        
        <span className="text-gray-300 font-medium">{projectName}</span>
      </div>

      {/* Center Section - Menu Items */}
      <div className="flex items-center space-x-1">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          >
            File
          </button>
          
          {showFileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-1 z-50 min-w-[160px]"
            >
              <button
                onClick={() => {
                  onSave?.();
                  setShowFileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
              >
                <Save className="h-3 w-3" />
                <span>Save Project</span>
                <span className="ml-auto text-xs text-gray-500">Ctrl+S</span>
              </button>
              
              <div className="h-px bg-gray-600 my-1"></div>
              
              <button
                onClick={() => {
                  onExport?.();
                  setShowFileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
              >
                <Download className="h-3 w-3" />
                <span>Export Project</span>
              </button>
              
              <button
                onClick={() => {
                  onImport?.();
                  setShowFileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
              >
                <Upload className="h-3 w-3" />
                <span>Import Project</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* View Menu */}
        <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors">
          View
        </button>

        {/* Tools Menu */}
        <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors">
          Tools
        </button>
      </div>

      {/* Right Section - Controls and User Menu */}
      <div className="flex items-center space-x-2">
        {/* Project Controls */}
        <div className="flex items-center space-x-1 mr-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRunProject}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700/50 rounded transition-colors"
            title="Run Project"
          >
            <Play className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTogglePreview}
            className={`p-2 rounded transition-colors ${
              isPreviewVisible 
                ? 'text-cyan-400 hover:text-cyan-300 bg-gray-700/50' 
                : 'text-gray-400 hover:text-white'
            } hover:bg-gray-700/50`}
            title="Toggle Preview"
          >
            <Square className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFullscreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </motion.button>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span>{userName}</span>
          </button>
          
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-1 z-50 min-w-[140px]"
            >
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-600">
                Signed in as<br />
                <span className="font-medium text-gray-300">{userName}</span>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
              >
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </button>
              
              <div className="h-px bg-gray-600 my-1"></div>
              
              <button
                onClick={() => {
                  onLogout?.();
                  setShowUserMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center space-x-2"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuBar;