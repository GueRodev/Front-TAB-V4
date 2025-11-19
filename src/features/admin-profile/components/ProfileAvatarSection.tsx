/**
 * ProfileAvatarSection Component
 * Displays and manages user avatar with edit capability
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ProfileAvatarSectionProps {
  name: string;
  role: string;
  avatarUrl?: string;
  avatarPreview?: string | null;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  name,
  role,
  avatarUrl,
  avatarPreview,
  isEditing,
  onAvatarChange,
}) => {
  return (
    <div className="flex items-center gap-6 pb-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarPreview || avatarUrl} alt={name} />
          <AvatarFallback className="text-2xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        {isEditing && (
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 cursor-pointer"
          >
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </label>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};