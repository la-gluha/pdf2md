import React from 'react';
import { FileItem, ProcessingStatus } from '../types';
import { Icons } from './Icons';

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, onPreview, onDownload }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {files.map((item) => (
        <div 
          key={item.id} 
          className="group relative flex items-center justify-between p-4 rounded-xl bg-surface/40 border border-white/5 hover:border-white/10 hover:bg-surface/60 transition-all duration-200"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border border-white/5
              ${item.status === ProcessingStatus.COMPLETED ? 'bg-green-500/10 text-green-400' : ''}
              ${item.status === ProcessingStatus.ERROR ? 'bg-red-500/10 text-red-400' : ''}
              ${item.status === ProcessingStatus.PROCESSING ? 'bg-indigo-500/10 text-indigo-400' : ''}
              ${item.status === ProcessingStatus.IDLE ? 'bg-white/5 text-muted' : ''}
            `}>
               {item.status === ProcessingStatus.COMPLETED && <Icons.Check className="w-5 h-5" />}
               {item.status === ProcessingStatus.ERROR && <Icons.Error className="w-5 h-5" />}
               {item.status === ProcessingStatus.PROCESSING && <Icons.Spinner className="w-5 h-5 animate-spin" />}
               {(item.status === ProcessingStatus.PENDING || item.status === ProcessingStatus.IDLE) && <Icons.File className="w-5 h-5" />}
            </div>

            <div className="flex flex-col min-w-0">
               <p className="text-sm font-medium text-text truncate max-w-[200px] sm:max-w-md">
                 {item.file.name}
               </p>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-secondary">
                   {(item.file.size / 1024 / 1024).toFixed(2)} MB
                 </span>
                 {item.status === ProcessingStatus.ERROR && (
                   <span className="text-xs text-red-400 truncate max-w-[150px]">
                      • {item.errorMessage}
                   </span>
                 )}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             {item.status === ProcessingStatus.COMPLETED && (
                <>
                  <button 
                    onClick={() => onPreview(item)}
                    className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                    title="Preview"
                  >
                    <Icons.Preview className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDownload(item)}
                    className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                    title="Download"
                  >
                    <Icons.Download className="w-4 h-4" />
                  </button>
                </>
             )}
             
             <button 
               onClick={() => onRemove(item.id)}
               className="p-2 rounded-lg text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
               title="Remove"
             >
               <Icons.Delete className="w-4 h-4" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;