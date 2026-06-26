'use client';

import { FC, useState, useTransition } from 'react';
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from '@repo/types/features/profile';
import { updateProfileAction } from '../actions';

type EditProfileFormProps = {
  username: string;
  initialDisplayName: string;
  initialBio: string | null;
  initialAvatarUrl: string | null;
  onCancel: () => void;
  onSaved: () => void;
};

export const EditProfileForm: FC<EditProfileFormProps> = ({
  username,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  onCancel,
  onSaved,
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bioRemaining = MAX_BIO_LENGTH - bio.length;
  const isDisabled = displayName.trim().length === 0 || isPending;

  const handleSubmit = () => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateProfileAction(
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
  };

  const inputClass =
    'focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]';
  const labelClass = 'text-sm font-medium text-[var(--color-text-muted)]';

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="edit-display-name" className="flex flex-col gap-1">
        <span className={labelClass}>Display name</span>
        <input
          id="edit-display-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          className={inputClass}
        />
      </label>
      <div>
        <label htmlFor="edit-bio" className="flex flex-col gap-1">
          <span className={labelClass}>Bio</span>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </label>
        <p
          className={`mt-1 text-sm ${bioRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}
        >
          {bioRemaining} characters left
        </p>
      </div>
      <label htmlFor="edit-avatar-url" className="flex flex-col gap-1">
        <span className={labelClass}>Avatar URL</span>
        <input
          id="edit-avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="https://example.com/avatar.png"
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
