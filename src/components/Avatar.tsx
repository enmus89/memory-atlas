import React, { useState } from 'react';
import { UserProfile } from '../types';

/**
 * A user's avatar, falling back to their initials on a coloured tile.
 *
 * New accounts start with no avatar at all — no stock photo standing in for a
 * person who has not chosen one — so the initials tile is the normal state
 * until somebody uploads an image. It is also the fallback when an uploaded
 * avatar's signed URL has expired or the image fails to load.
 */

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  user: Pick<UserProfile, 'name' | 'avatar' | 'avatarColor'>;
  className?: string;
  /** Tailwind text size for the initials; tune per call site. */
  textClassName?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  className = 'w-9 h-9 rounded-xl',
  textClassName = 'text-xs'
}) => {
  const [failed, setFailed] = useState(false);

  if (user.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        onError={() => setFailed(true)}
        className={`${className} object-cover border border-slate-200`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center font-bold text-white select-none`}
      style={{ backgroundColor: user.avatarColor || '#2563eb' }}
      aria-label={user.name}
      title={user.name}
    >
      <span className={textClassName}>{initialsOf(user.name)}</span>
    </div>
  );
};
