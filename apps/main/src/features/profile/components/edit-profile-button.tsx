'use client';

import { useState } from 'react';
import { EditProfileForm } from './edit-profile-form';

type EditProfileButtonProps = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function EditProfileButton({
  username,
  displayName,
  bio,
  avatarUrl,
}: EditProfileButtonProps) {
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
      className="focus-ring rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      Edit profile
    </button>
  );
}
