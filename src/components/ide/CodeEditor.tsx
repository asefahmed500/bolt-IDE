import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { ProjectFile } from '../../types';

interface CodeEditorProps {
  file: ProjectFile | null;
  onChange: (content: string) => void;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  file, 
  onChange, 
  className = '' 
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Monaco editor
    monaco.editor.defineTheme('dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#0F1419',
        'editor.foreground': '#E6E6E6',
        'editorLineNumber.foreground': '#495162',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.selectionHighlightBackground': '#ADD6FF26',
      }
    });
    
    monaco.editor.setTheme('dark-theme');
    
    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality can be added here
      console.log('Save shortcut pressed');
    });
  };

  const getLanguage = (fileType: string) => {
    switch (fileType) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      default:
        return 'plaintext';
    }
  };

  if (!file) {
    return (
      <div className={`flex items-center justify-center bg-gray-900/50 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-400"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">No File Selected</h3>
          <p className="text-sm">Select a file from the explorer to start coding</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 ${className}`}>
      {/* Editor Header */}
      <div className="h-10 bg-gray-800/50 border-b border-gray-700/50 flex items-center px-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            file.type === 'html' ? 'bg-orange-400' :
            file.type === 'css' ? 'bg-blue-400' :
            file.type === 'js' ? 'bg-yellow-400' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-300 font-medium">{file.name}</span>
          <span className="text-xs text-gray-500 uppercase">{file.type}</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-[calc(100%-2.5rem)]">
        <Editor
          key={file.id} // Force re-render when file changes
          language={getLanguage(file.type)}
          value={file.content}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            autoIndent: 'full',
            formatOnType: true,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            parameterHints: { enabled: true },
            hover: { enabled: true },
            contextmenu: true,
            mouseWheelZoom: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false
            }
          }}
          theme="dark-theme"
        />
      </div>
    </div>
  );
};

export default CodeEditor;