import { useRef, type ChangeEvent } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { RESUME_ACCEPTED_EXTENSIONS, RESUME_MAX_SIZE_BYTES } from '@/lib/candidatesApi';

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ file, onChange, error }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    onChange(selected);
  };

  return (
    <div>
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center transition-colors hover:border-brand-green-400 hover:bg-brand-green-50"
        >
          <Upload className="h-6 w-6 text-brand-green-600" aria-hidden="true" />
          <span className="text-sm font-medium text-neutral-700">
            Clique para anexar seu currículo
          </span>
          <span className="text-xs text-neutral-500">
            PDF, DOC, DOCX, JPG ou PNG — máximo de {formatSize(RESUME_MAX_SIZE_BYTES)}
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-green-300 bg-brand-green-50 px-4 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-5 w-5 shrink-0 text-brand-green-700" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-800">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remover arquivo"
            className="rounded-full p-1.5 text-neutral-500 hover:bg-white hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPTED_EXTENSIONS}
        onChange={handleSelect}
        className="hidden"
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
