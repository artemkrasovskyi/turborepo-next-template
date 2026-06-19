'use client';

import { useState, useTransition } from 'react';
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from '@repo/types/features/profile';
import { updateProfileAction } from '../actions';

type EditProfileFormProps = {
  userId: string;
  username: string;
  initialDisplayName: string;
  initialBio: string | null;
  initialAvatarUrl: string | null;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditProfileForm({
  userId,
  username,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  onCancel,
  onSaved,
}: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bioRemaining = MAX_BIO_LENGTH - bio.length;
  const isDisabled = displayName.trim().length === 0 || isPending;

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateProfileAction(
          userId,
          username,
          displayName,
          bio || null,
          avatarUrl || null,
        );

        if (result.error) {
          setError(result.error);
          return;
        }

        onSaved();
      } catch {
        setError('Could not save profile. Please try again.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="edit-display-name" className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Display name</span>
        <input
          id="edit-display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      <div>
        <label htmlFor="edit-bio" className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Bio</span>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </label>
        <p className={`mt-1 text-sm ${bioRemaining < 0 ? 'text-red-600' : 'text-slate-500'}`}>
          {bioRemaining} characters left
        </p>
      </div>
      <label htmlFor="edit-avatar-url" className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Avatar URL</span>
        <input
          id="edit-avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="focus-ring rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="focus-ring rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
