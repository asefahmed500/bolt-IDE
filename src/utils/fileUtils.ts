import { ProjectFile } from '../types';

export const createNewFile = (name: string, type: 'html' | 'css' | 'js'): ProjectFile => {
  return {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    content: '',
    type,
    lastModified: new Date()
  };
};

export const getFileIcon = (type: string) => {
  const icons = {
    html: '🌐',
    css: '🎨',
    js: '⚡',
    folder: '📁',
    default: '📄'
  };
  return icons[type as keyof typeof icons] || icons.default;
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

export const isValidFileName = (name: string): boolean => {
  const validPattern = /^[a-zA-Z0-9_-]+\.(html|css|js)$/;
  return validPattern.test(name);
};

export const generateUniqueFileName = (baseName: string, existingFiles: ProjectFile[]): string => {
  const existingNames = existingFiles.map(f => f.name);
  
  if (!existingNames.includes(baseName)) {
    return baseName;
  }
  
  const [name, ext] = baseName.split('.');
  let counter = 1;
  
  while (existingNames.includes(`${name}_${counter}.${ext}`)) {
    counter++;
  }
  
  return `${name}_${counter}.${ext}`;
};