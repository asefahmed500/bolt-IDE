export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: 'html' | 'css' | 'js';
  lastModified: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  createdAt: Date;
  lastModified: Date;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  content?: string;
  fileType?: 'html' | 'css' | 'js';
}