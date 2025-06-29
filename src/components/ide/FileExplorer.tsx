import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  File, 
  Plus, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Download,
  FileText,
  Palette,
  Zap
} from 'lucide-react';
import { ProjectFile } from '../../types';
import { getFileIcon, isValidFileName, generateUniqueFileName } from '../../utils/fileUtils';
import { getTemplate } from '../../utils/codeTemplates';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (name: string, type: 'html' | 'css' | 'js') => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile
}) => {
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'html' | 'css' | 'js'>('html');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [fileMenuId, setFileMenuId] = useState<string | null>(null);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      let fileName = newFileName.trim();
      
      // Add extension if not provided
      if (!fileName.includes('.')) {
        fileName += `.${newFileType}`;
      }
      
      if (isValidFileName(fileName)) {
        const uniqueName = generateUniqueFileName(fileName, files);
        onCreateFile(uniqueName, newFileType);
        setNewFileName('');
        setShowNewFileModal(false);
      } else {
        alert('Please enter a valid filename with .html, .css, or .js extension');
      }
    }
  };

  const handleRenameFile = (fileId: string) => {
    if (editFileName.trim() && isValidFileName(editFileName.trim())) {
      const uniqueName = generateUniqueFileName(editFileName.trim(), files.filter(f => f.id !== fileId));
      onRenameFile(fileId, uniqueName);
      setEditingFileId(null);
      setEditFileName('');
    }
  };

  const startRename = (file: ProjectFile) => {
    setEditingFileId(file.id);
    setEditFileName(file.name);
    setFileMenuId(null);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <FileText className="h-4 w-4 text-orange-400" />;
      case 'css':
        return <Palette className="h-4 w-4 text-blue-400" />;
      case 'js':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const fileTypeTemplates = [
    { type: 'html' as const, label: 'HTML File', icon: FileText, color: 'text-orange-400' },
    { type: 'css' as const, label: 'CSS File', icon: Palette, color: 'text-blue-400' },
    { type: 'js' as const, label: 'JavaScript File', icon: Zap, color: 'text-yellow-400' }
  ];

  return (
    <div className="h-full bg-gray-900/50 border-r border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Explorer</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNewFileModal(true)}
            className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50 rounded transition-colors"
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* File List */}
      <div className="p-2">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group relative mb-1 rounded-lg transition-all duration-200 ${
                activeFileId === file.id
                  ? 'bg-cyan-500/20 border border-cyan-500/30'
                  : 'hover:bg-gray-700/30'
              }`}
            >
              {editingFileId === file.id ? (
                <div className="p-2">
                  <input
                    type="text"
                    value={editFileName}
                    onChange={(e) => setEditFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFile(file.id);
                      } else if (e.key === 'Escape') {
                        setEditingFileId(null);
                        setEditFileName('');
                      }
                    }}
                    onBlur={() => handleRenameFile(file.id)}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="flex items-center p-2 cursor-pointer"
                  onClick={() => onSelectFile(file)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {getFileTypeIcon(file.type)}
                    <span className="ml-2 text-sm text-gray-300 truncate">{file.name}</span>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileMenuId(fileMenuId === file.id ? null : file.id);
                      }}
                      className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                    
                    {fileMenuId === file.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-1 z-50 min-w-[120px]"
                      >
                        <button
                          onClick={() => startRename(file)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Rename</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${file.name}?`)) {
                              onDeleteFile(file.id);
                            }
                            setFileMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center space-x-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 mt-1"
            >
              Create your first file
            </button>
          </div>
        )}
      </div>

      {/* New File Modal */}
      <AnimatePresence>
        {showNewFileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              <h3 className="text-xl font-bold mb-4 text-white">Create New File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {fileTypeTemplates.map((template) => (
                      <button
                        key={template.type}
                        onClick={() => setNewFileType(template.type)}
                        className={`p-3 rounded-lg border transition-all ${
                          newFileType === template.type
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <template.icon className={`h-5 w-5 mx-auto mb-1 ${template.color}`} />
                        <p className="text-xs text-gray-300">{template.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder={`example.${newFileType}`}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Extension will be added automatically if not provided
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowNewFileModal(false);
                    setNewFileName('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-white"
                >
                  Create File
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileExplorer;