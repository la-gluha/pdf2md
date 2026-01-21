export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface FileItem {
  id: string;
  file: File;
  status: ProcessingStatus;
  markdown: string | null;
  errorMessage: string | null;
  progress: number; // 0 to 100
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}