import { UserProfile } from "@/components/user-profile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Link from "next/link";

// Define the types for search params
interface SearchParams {
  message?: string;
  error?: string;
  success?: string;
  type?: string;
}

// Define the battle type
interface Battle {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

// Define the battle participation type
interface BattleParticipation {
  battle_id: string;
  battles: Battle | null;
}

// For Next.js 14+, searchParams is a ReadonlyURLSearchParams object
export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin
  let isAdmin = false;
  try {
    // First check if the user_roles table exists
    const { count, error: countError } = await supabase
      .from('user_roles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error checking user_roles table:", countError);
      console.error("The user_roles table might not exist. Please run the SQL queries from RBAC-MANUAL-SETUP.md");
    } else {
      // Table exists, check user's role
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!error && userRole) {
        isAdmin = userRole.role === 'admin';
      } else {
        console.error("Error fetching user role:", error);
      }
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
  
  // Fallback for admin check - if email matches a predefined admin email
  if (!isAdmin && user.email) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    isAdmin = adminEmails.includes(user.email.toLowerCase());
  }
  
  // Get message from query params - handle as simple object, not promise
  const messageType = searchParams.type as string | undefined;
  const messageText = searchParams.message as string | undefined;
  
  const message = messageText
    ? {
        [messageType === 'error' ? 'error' : 'success']: messageText,
      } as Message
    : null;

  // Get battles created by the user
  const { data: createdBattles, error: createdError } = await supabase
    .from('battles')
    .select('id, title, status, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (createdError) {
    console.error("Error fetching created battles:", createdError);
  }

  // Get battles the user is participating in
  const { data: participatingBattles, error: participatingError } = await supabase
    .from('battle_participants')
    .select(`
      battle_id,
      battles(id, title, status, created_at)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (participatingError) {
    console.error("Error fetching participating battles:", participatingError);
  }

  // Function to determine status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'bg-blue-100 text-blue-800';
      case 'voting':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-4xl mx-auto py-8 px-4">
      <div className="w-full flex justify-between items-start">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <div className="flex gap-2">
          <Link href="/battles">
            <Button variant="outline">View All Battles</Button>
          </Link>
        </div>
      </div>
      
      <UserProfile user={user} />
      
      {message && (
        <div className="w-full">
          <FormMessage message={message} />
        </div>
      )}
      
      <div className="flex flex-col gap-2 items-start">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-2xl mb-4">Meme Battles</h2>
          {isAdmin && (
            <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-xs font-bold px-2 py-1 rounded-full text-white">ADMIN</span>
          )}
        </div>
        
        <p className="text-muted-foreground">
          {isAdmin 
            ? "As an admin, you can create meme battles for everyone to participate in."
            : "You haven't participated in any meme battles yet. Wait for an admin to create one!"}
        </p>
        
        {isAdmin && (
          <div className="mt-4">
            <a 
              href="/battles/create" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create a Battle
            </a>
          </div>
        )}
      </div>

      <div className="space-y-8 mt-12">
        {isAdmin && createdBattles && createdBattles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Battles You Created
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {createdBattles.map((battle: any) => (
                <Link 
                  key={battle.id} 
                  href={`/battles/${battle.id}`}
                  className="block"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-all p-4 border border-white/5 hover:border-pink-500/30">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white">{battle.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(battle.status)}`}>
                        {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Created on {new Date(battle.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {participatingBattles && participatingBattles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Battles You're Participating In
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {participatingBattles.map((participation: any) => (
                <Link 
                  key={participation.battle_id} 
                  href={`/battles/${participation.battle_id}`}
                  className="block"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-all p-4 border border-white/5 hover:border-purple-500/30">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white">{participation.battles?.title || 'Untitled Battle'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(participation.battles?.status || 'unknown')}`}>
                        {participation.battles?.status 
                          ? participation.battles.status.charAt(0).toUpperCase() + participation.battles.status.slice(1) 
                          : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Created on {participation.battles?.created_at 
                        ? new Date(participation.battles.created_at).toLocaleDateString() 
                        : 'Unknown date'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(!participatingBattles || participatingBattles.length === 0) && 
         (!createdBattles || createdBattles.length === 0) && (
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No battles yet</h3>
            <p className="text-gray-400 mb-6">
              {isAdmin 
                ? "Create your first battle or join an existing one"
                : "Join a battle to get started"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAdmin && (
                <Link href="/battles/create">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    Create a Battle
                  </Button>
                </Link>
              )}
              <Link href="/battles">
                <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white">
                  View Available Battles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
