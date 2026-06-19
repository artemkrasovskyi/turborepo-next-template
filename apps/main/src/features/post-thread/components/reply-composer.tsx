'use client';

import { useRef, useState, useTransition } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';
import { createReplyAction } from '../actions';

const MAX_IMAGES = 4;

type ReplyComposerProps = {
  authorId: string;
  parentId: string;
};

type PreviewImage = {
  objectUrl: string;
  file: File;
};

export function ReplyComposer({ authorId, parentId }: ReplyComposerProps) {
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

        const result = await createReplyAction(authorId, parentId, body, imageUrls);

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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Post your reply"
        rows={3}
        aria-label="Compose a reply"
        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
      />

      {previews.length > 0 ? (
        <div className={`mt-3 grid gap-1 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {previews.map((preview, index) => (
            <div key={preview.objectUrl} className="relative overflow-hidden rounded-lg">
              <img src={preview.objectUrl} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80"
                aria-label="Remove image"
              >
                ×
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
            className="focus-ring rounded p-1 text-slate-500 hover:text-teal-600 disabled:opacity-40"
            aria-label="Add images"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </button>
          <p className={`text-sm ${remaining < 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {remaining} characters left
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="focus-ring rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : isPending ? 'Replying…' : 'Reply'}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
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
