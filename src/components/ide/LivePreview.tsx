import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Maximize2, 
  Monitor, 
  Smartphone, 
  Tablet,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { ProjectFile } from '../../types';

interface LivePreviewProps {
  files: ProjectFile[];
  className?: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ files, className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const getViewportDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const generatePreviewContent = () => {
    const htmlFile = files.find(f => f.type === 'html');
    const cssFile = files.find(f => f.type === 'css');
    const jsFile = files.find(f => f.type === 'js');

    if (!htmlFile) {
      return `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
              }
              .message {
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
            </style>
          </head>
          <body>
            <div class="message">
              <h2>📄 No HTML File Found</h2>
              <p>Create an HTML file to see your preview here!</p>
            </div>
          </body>
        </html>
      `;
    }

    let htmlContent = htmlFile.content;
    
    // Inject CSS
    if (cssFile && cssFile.content.trim()) {
      const cssToInject = `<style>${cssFile.content}</style>`;
      
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${cssToInject}</head>`);
      } else if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace('<head>', `<head>${cssToInject}`);
      } else {
        htmlContent = `<head>${cssToInject}</head>${htmlContent}`;
      }
    }
    
    // Inject JavaScript with error handling
    if (jsFile && jsFile.content.trim()) {
      const jsToInject = `
        <script>
          // Console override to capture errors
          window.addEventListener('error', function(e) {
            parent.postMessage({
              type: 'error',
              message: e.message,
              filename: e.filename,
              lineno: e.lineno
            }, '*');
          });
          
          try {
            ${jsFile.content}
          } catch (error) {
            parent.postMessage({
              type: 'error',
              message: error.message
            }, '*');
          }
        </script>
      `;
      
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${jsToInject}</body>`);
      } else {
        htmlContent = `${htmlContent}${jsToInject}`;
      }
    }
    
    return htmlContent;
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    setIsLoading(true);
    setErrors([]);
    
    const content = generatePreviewContent();
    
    try {
      iframeRef.current.srcdoc = content;
      
      // Clear loading state after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
    } catch (error) {
      console.error('Preview update error:', error);
      setErrors([`Preview Error: ${error}`]);
      setIsLoading(false);
    }
  };

  // Listen for error messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setErrors(prev => [...prev, event.data.message]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update preview when files change
  useEffect(() => {
    const timeoutId = setTimeout(updatePreview, 300); // Debounce updates
    return () => clearTimeout(timeoutId);
  }, [files]);

  const refreshPreview = () => {
    setIsLoading(true);
    setTimeout(updatePreview, 100);
  };

  const openInNewTab = () => {
    const content = generatePreviewContent();
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  const dimensions = getViewportDimensions();

  return (
    <div className={`bg-gray-900/50 flex flex-col ${className}`}>
      {/* Preview Header */}
      <div className="h-12 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-300">Live Preview</h3>
          
          {errors.length > 0 && (
            <div className="flex items-center space-x-1 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">{errors.length} error{errors.length > 1 ? 's' : ''}</span>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-cyan-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="text-xs">Updating...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewport Size Controls */}
          <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'desktop' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'tablet' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'mobile' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="h-3 w-3" />
            </button>
          </div>
          
          <button
            onClick={refreshPreview}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-gray-800/30 p-4 overflow-auto">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="h-full flex items-center justify-center"
        >
          <div
            className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
              viewMode !== 'desktop' ? 'mx-auto' : 'w-full h-full'
            }`}
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Live Preview"
            />
          </div>
        </motion.div>
      </div>

      {/* Error Console */}
      {errors.length > 0 && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-red-900/20 border-t border-red-500/30 p-3 max-h-32 overflow-y-auto"
        >
          <div className="text-xs">
            {errors.map((error, index) => (
              <div key={index} className="text-red-400 mb-1 font-mono">
                {error}
              </div>
            ))}
          </div>
          <button
            onClick={() => setErrors([])}
            className="text-xs text-red-300 hover:text-red-200 mt-2"
          >
            Clear Errors
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default LivePreview;