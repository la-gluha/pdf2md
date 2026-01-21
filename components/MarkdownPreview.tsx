import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from './Icons';

interface MarkdownPreviewProps {
  content: string;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  filename, 
  isOpen, 
  onClose,
  onDownload 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl h-[80vh] bg-background border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface/50 backdrop-blur">
          <div className="flex items-center gap-3">
             <div className="p-1.5 rounded-md bg-indigo-500/10">
               <Icons.File className="w-4 h-4 text-indigo-400" />
             </div>
             <h3 className="font-medium text-text">{filename.replace('.pdf', '.md')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:bg-white transition-colors"
            >
              <Icons.Download className="w-3 h-3" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-secondary hover:text-text hover:bg-white/5 transition-colors"
            >
              <Icons.Close className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-background/50">
          <article className="prose prose-invert prose-zinc max-w-none 
            prose-headings:text-text prose-headings:font-semibold
            prose-p:text-secondary prose-p:leading-7
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-pre:bg-surfaceHighlight prose-pre:border prose-pre:border-white/5
            prose-strong:text-text
            prose-ul:marker:text-secondary
            ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;