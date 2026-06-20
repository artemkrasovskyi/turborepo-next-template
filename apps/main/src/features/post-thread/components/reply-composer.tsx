'use client';

import { useRef, useState, useTransition } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';
import { createReplyAction } from '../actions';

const MAX_IMAGES = 4;

type ReplyComposerProps = {
  parentId: string;
};

type PreviewImage = {
  objectUrl: string;
  file: File;
};

export function ReplyComposer({ parentId }: ReplyComposerProps) {
  const [body, setBody] = useState('');
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('imageUploader');

  const remaining = MAX_POST_LENGTH - body.length;
  const isDisabled =
    (body.trim().length === 0 && previews.length === 0) ||
    remaining < 0 ||
    isPending ||
    isUploading;
  let submitLabel = 'Reply';
  if (isUploading) {
    submitLabel = 'Uploading…';
  } else if (isPending) {
    submitLabel = 'Replying…';
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const available = MAX_IMAGES - previews.length;
    const selected = files.slice(0, available);

    const newPreviews = selected.map((file) => ({
      objectUrl: URL.createObjectURL(file),
      file,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]!.objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      try {
        let imageUrls: string[] = [];

        if (previews.length > 0) {
          setIsUploading(true);
          const uploaded = await startUpload(previews.map((p) => p.file));
          setIsUploading(false);

          if (!uploaded) {
            setError('Image upload failed. Please try again.');
            return;
          }

          imageUrls = uploaded.map((f) => f.ufsUrl);
        }

        const result = await createReplyAction(parentId, body, imageUrls);

        if (result.error) {
          setError(result.error);
          return;
        }

        previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
        setBody('');
        setPreviews([]);
      } catch {
        setIsUploading(false);
        setError('Could not post reply. Please try again.');
      }
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Post your reply"
        rows={3}
        aria-label="Compose a reply"
        className="focus-ring w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
      />

      {previews.length > 0 ? (
        <div
          className={`mt-3 grid gap-1 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {previews.map((preview, index) => (
            <div key={preview.objectUrl} className="relative overflow-hidden rounded-lg">
              <img src={preview.objectUrl} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="focus-ring absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={previews.length >= MAX_IMAGES || isPending || isUploading}
            className="focus-ring rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] disabled:opacity-40"
            aria-label="Add images"
          >
            <ImagePlus size={20} aria-hidden="true" />
          </button>
          <p
            className={`text-sm ${remaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}
          >
            {remaining}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
