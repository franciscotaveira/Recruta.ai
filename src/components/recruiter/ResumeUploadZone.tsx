import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  jobId: string;
  onSuccess?: (data: any) => void;
}

const ResumeUploadZone: React.FC<Props> = ({ jobId, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Por favor, envie apenas PDF ou Imagens.' });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/resumes/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            jobId,
            fileName: file.name,
            fileType: file.type,
            base64
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro no upload');

        setStatus({ 
          type: 'success', 
          message: `Candidato ${data.candidateName} processado e convidado via WhatsApp!` 
        });
        onSuccess?.(data);
      };
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [jobId]);

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer
          ${isDragging 
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-[1.02]' 
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={isUploading}
        />

        {isUploading ? (
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-purple-500">
            <Upload size={32} />
          </div>
        )}

        <div className="text-center">
          <p className="font-bold text-slate-900 dark:text-white">
            {isUploading ? 'Processando Currículo com IA...' : 'Arraste currículos ou clique para subir'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Formatos aceitos: PDF, PNG, JPG (Máx 10MB)
          </p>
        </div>

        {status && (
          <div className={`mt-2 flex items-center gap-2 p-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2
            ${status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
          >
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}
      </div>
      
      <p className="mt-3 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 uppercase tracking-wider font-bold">
        <FileText size={12} /> Criptografado e em conformidade com a LGPD
      </p>
    </div>
  );
};

export default ResumeUploadZone;
