import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Project } from '../types';

export const exportProject = async (project: Project): Promise<void> => {
  const zip = new JSZip();
  
  // Add all project files to the zip
  project.files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  // Add a README.md file with project info
  const readme = `# ${project.name}

${project.description || 'A project created with Real-Time IDE'}

## Files Included:
${project.files.map(f => `- ${f.name} (${f.type.toUpperCase()})`).join('\n')}

## How to use:
1. Extract all files to a folder
2. Open index.html in your web browser
3. Enjoy your project!

---
Created with Real-Time IDE ✨
`;
  
  zip.file('README.md', readme);
  
  // Generate and download the zip file
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${project.name.replace(/\s+/g, '_')}.zip`);
  } catch (error) {
    console.error('Error exporting project:', error);
    throw new Error('Failed to export project');
  }
};

export const exportSingleFile = (fileName: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
};

export const importProject = async (file: File): Promise<Project | null> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    const files = [];
    
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
        const content = await zipEntry.async('text');
        const extension = filename.split('.').pop() as 'html' | 'css' | 'js';
        
        files.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: filename,
          content,
          type: extension,
          lastModified: new Date()
        });
      }
    }
    
    if (files.length === 0) {
      throw new Error('No valid files found in the imported project');
    }
    
    const projectName = file.name.replace('.zip', '');
    
    return {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: projectName,
      description: 'Imported project',
      files,
      createdAt: new Date(),
      lastModified: new Date(),
      userId: localStorage.getItem('userId') || 'default'
    };
  } catch (error) {
    console.error('Error importing project:', error);
    return null;
  }
};