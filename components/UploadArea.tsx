import React, { useRef, useState, useCallback } from 'react';
import { Icons } from './Icons';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent flickering when dragging over children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  // Recursive function to traverse file system entries (for folders)
  const traverseFileTree = async (item: any): Promise<File[]> => {
    const files: File[] = [];
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file: File) => {
          resolve([file]);
        }, () => resolve([]));
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      const entries = await new Promise<any[]>((resolve) => {
         const allEntries: any[] = [];
         const readEntries = () => {
           dirReader.readEntries((result: any[]) => {
             if (result.length === 0) {
               resolve(allEntries);
             } else {
               allEntries.push(...result);
               readEntries();
             }
           }, () => resolve(allEntries));
         };
         readEntries();
      });
      
      const nestedResults = await Promise.all(entries.map((entry) => traverseFileTree(entry)));
      nestedResults.forEach(nestedFiles => files.push(...nestedFiles));
    }
    return files;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const collectedFiles: File[] = [];

    if (items) {
      const promises: Promise<File[]>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // webkitGetAsEntry is standard in modern browsers for DnD API
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          promises.push(traverseFileTree(entry));
        } else if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) promises.push(Promise.resolve([file]));
        }
      }
      const results = await Promise.all(promises);
      results.flat().forEach(file => {
         // Check mime type or extension
         if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            collectedFiles.push(file);
         }
      });
    } else if (e.dataTransfer.files) {
      // Fallback for older browsers
       Array.from(e.dataTransfer.files).forEach(file => {
         if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            collectedFiles.push(file);
         }
       });
    }

    if (collectedFiles.length > 0) {
      onFilesSelected(collectedFiles);
    }
  }, [onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      onFilesSelected(selectedFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      onFilesSelected(selectedFiles);
    }
     if (folderInputRef.current) folderInputRef.current.value = '';
  };

  return (
    <div 
      className={`
        relative w-full p-10 rounded-2xl border-2 border-dashed transition-all duration-300 group
        flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.01]' 
          : 'border-white/10 bg-surface/50 hover:border-white/20 hover:bg-surface'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className={`p-4 rounded-full bg-surfaceHighlight/50 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Icons.Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted group-hover:text-text'}`} />
      </div>

      <h3 className="text-lg font-medium text-text mb-2">
        Upload PDF Files
      </h3>
      <p className="text-sm text-secondary mb-6 max-w-sm">
        Drag and drop your files here, or click to browse.
      </p>

      <div className="flex gap-3 relative z-10" onClick={(e) => e.stopPropagation()}>
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf"
            multiple 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-text text-background rounded-lg text-sm font-semibold hover:bg-white transition-colors shadow-lg shadow-white/5"
          >
            Select Files
          </button>

          <input 
            type="file" 
            ref={folderInputRef}
            onChange={handleFolderChange}
            // @ts-ignore
            webkitdirectory=""
            directory=""
            multiple
            className="hidden" 
          />
          <button 
            onClick={() => folderInputRef.current?.click()}
            className="px-4 py-2 bg-surfaceHighlight border border-white/5 text-text rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Scan Folder
          </button>
      </div>
    </div>
  );
};

export default UploadArea;