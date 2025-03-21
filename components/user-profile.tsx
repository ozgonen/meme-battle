import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  // Get user metadata
  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.name || 'User';
  const email = user.email || '';
  const avatarUrl = metadata.avatar_url || '';
  
  // Get initials for avatar fallback
  const initials = name
    .split(' ')
    .map((n: string) => n[0] || '')
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:shadow-purple-500/20 transition-all">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-sm"></div>
          <Avatar className="h-20 w-20 border-4 border-white/20 relative">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-700 text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">{name}</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between border-b border-purple-200/20 pb-3">
          <span className="text-purple-200 font-medium">Email:</span>
          <span>{email}</span>
        </div>
        <div className="flex justify-between border-b border-purple-200/20 pb-3">
          <span className="text-purple-200 font-medium">Account ID:</span>
          <span>{user.id.substring(0, 8)}...</span>
        </div>
        <div className="flex justify-between border-b border-purple-200/20 pb-3">
          <span className="text-purple-200 font-medium">Last Sign In:</span>
          <span>{new Date(user.last_sign_in_at || '').toLocaleString()}</span>
        </div>
        <div className="mt-8 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-purple-200 font-medium">Meme Battle Rank:</span>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text font-bold">ROOKIE</span>
          </div>
          <div className="w-full bg-purple-950 rounded-full h-2.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-600 h-2.5 rounded-full w-[15%]"></div>
          </div>
          <p className="text-sm text-purple-300 mt-2">Win more battles to increase your rank!</p>
        </div>
      </div>
    </div>
  );
} 