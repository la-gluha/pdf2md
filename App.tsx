import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UploadArea from './components/UploadArea';
import FileList from './components/FileList';
import MarkdownPreview from './components/MarkdownPreview';
import { FileItem, ProcessingStatus } from './types';
import { convertPdfToMarkdown } from './services/geminiService';
import { convertPdfToMarkdownLocal } from './services/localPdfService';
import { Icons } from './components/Icons';

type ConversionMode = 'AI' | 'LOCAL';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('AI');

  // Stats
  const completedCount = files.filter(f => f.status === ProcessingStatus.COMPLETED).length;

  const handleFilesSelected = (newFiles: File[]) => {
    const newFileItems: FileItem[] = newFiles.map(file => ({
      id: uuidv4(),
      file,
      status: ProcessingStatus.IDLE,
      markdown: null,
      errorMessage: null,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFileItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadMarkdown = (item: FileItem) => {
    if (!item.markdown) return;
    const blob = new Blob([item.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.file.name.replace(/\.pdf$/i, '.md');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Queue Processing Logic
  useEffect(() => {
    const processQueue = async () => {
      const processing = files.some(f => f.status === ProcessingStatus.PROCESSING);
      if (processing) return;

      const nextFile = files.find(f => f.status === ProcessingStatus.IDLE);
      if (!nextFile) return;

      setFiles(prev => prev.map(f => 
        f.id === nextFile.id ? { ...f, status: ProcessingStatus.PROCESSING } : f
      ));

      try {
        let markdown = "";
        if (conversionMode === 'AI') {
          markdown = await convertPdfToMarkdown(nextFile.file);
        } else {
          markdown = await convertPdfToMarkdownLocal(nextFile.file);
        }
        
        setFiles(prev => prev.map(f => 
          f.id === nextFile.id ? { ...f, status: ProcessingStatus.COMPLETED, markdown } : f
        ));
      } catch (error: any) {
        console.error("Conversion failed", error);
        setFiles(prev => prev.map(f => 
          f.id === nextFile.id ? { ...f, status: ProcessingStatus.ERROR, errorMessage: error.message || "Failed" } : f
        ));
      }
    };
    processQueue();
  }, [files, conversionMode]);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col relative overflow-x-hidden selection:bg-indigo-500/20">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-50"></div>
      
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Icons.Markdown className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">PDF2MD</span>
          </div>
          <div className="flex items-center gap-4">
             <a href="#" className="text-sm text-muted hover:text-text transition-colors">Documentation</a>
             <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted hover:text-text transition-colors">
               <Icons.Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight">
            Convert PDFs to Markdown
          </h1>
          <p className="text-secondary max-w-lg mx-auto text-lg">
            Transform your documents into clean, structured markdown using advanced AI or local processing.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-8 p-1 bg-surfaceHighlight/50 rounded-xl border border-white/5 flex gap-1 shadow-inner">
          <button
            onClick={() => setConversionMode('AI')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              conversionMode === 'AI' 
                ? 'bg-surface shadow-sm text-white ring-1 ring-white/10' 
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            <Icons.Sparkles className={`w-4 h-4 ${conversionMode === 'AI' ? 'text-indigo-400' : ''}`} />
            AI Enhanced
          </button>
          <button
            onClick={() => setConversionMode('LOCAL')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              conversionMode === 'LOCAL' 
                ? 'bg-surface shadow-sm text-white ring-1 ring-white/10' 
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            <Icons.Zap className={`w-4 h-4 ${conversionMode === 'LOCAL' ? 'text-amber-400' : ''}`} />
            Local Only
          </button>
        </div>

        {/* Upload Area */}
        <div className="w-full max-w-2xl mb-12">
           <UploadArea onFilesSelected={handleFilesSelected} />
           {conversionMode === 'LOCAL' && (
             <p className="text-xs text-center mt-3 text-muted">
               Local mode runs entirely in your browser. No data leaves your device.
             </p>
           )}
        </div>

        {/* Stats & List */}
        {files.length > 0 && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Processing Queue</h3>
               <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-secondary border border-white/5">
                 {completedCount} / {files.length} Completed
               </span>
            </div>
            
            <FileList 
              files={files} 
              onRemove={removeFile}
              onPreview={(file) => setPreviewFile(file)}
              onDownload={downloadMarkdown}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="text-center text-xs text-muted">
           &copy; {new Date().getFullYear()} PDF2MD Converter. All rights reserved.
        </div>
      </footer>

      <MarkdownPreview 
        content={previewFile?.markdown || ''} 
        filename={previewFile?.file.name || ''}
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)}
        onDownload={() => previewFile && downloadMarkdown(previewFile)}
      />
    </div>
  );
};

export default App;