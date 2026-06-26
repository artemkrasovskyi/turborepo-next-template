'use client';

import { FC, useState } from 'react';
import { EditProfileForm } from './edit-profile-form';

type EditProfileButtonProps = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

export const EditProfileButton: FC<EditProfileButtonProps> = ({
  username,
  displayName,
  bio,
  avatarUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditProfileForm
        username={username}
        initialDisplayName={displayName}
        initialBio={bio}
        initialAvatarUrl={avatarUrl}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
    >
      Edit profile
    </button>
  );
}
