import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/utils/utils";

export default async function BattlesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createClient();
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin
  const isAdmin = await isUserAdmin(user.id, user.email);
  
  // Handle optional status filter
  const statusFilter = searchParams.status;
  let battlesQuery = supabase
    .from('battles')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false });
  
  if (statusFilter && ['collecting', 'voting', 'completed'].includes(statusFilter)) {
    battlesQuery = battlesQuery.eq('status', statusFilter);
  }
  
  const { data: battles, error } = await battlesQuery;
  
  if (error) {
    console.error("Error fetching battles:", error);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Meme Battles</h1>
          <div className="flex gap-2">
            <Link href="/protected">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white">
                Back to Profile
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/battles/create">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  Create a Battle
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Status filter tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <Link href="/battles">
            <Button 
              variant={!statusFilter ? "default" : "outline"}
              className={!statusFilter 
                ? "bg-gradient-to-r from-pink-500 to-purple-600" 
                : "border-white/20 hover:border-white/40"
              }
            >
              All Battles
            </Button>
          </Link>
          <Link href="/battles?status=collecting">
            <Button 
              variant={statusFilter === 'collecting' ? "default" : "outline"}
              className={statusFilter === 'collecting' 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              }
            >
              Collecting
            </Button>
          </Link>
          <Link href="/battles?status=voting">
            <Button 
              variant={statusFilter === 'voting' ? "default" : "outline"}
              className={statusFilter === 'voting' 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              }
            >
              Voting
            </Button>
          </Link>
          <Link href="/battles?status=completed">
            <Button 
              variant={statusFilter === 'completed' ? "default" : "outline"}
              className={statusFilter === 'completed' 
                ? "bg-green-600 hover:bg-green-700" 
                : "border-green-500/50 text-green-400 hover:bg-green-500/10"
              }
            >
              Completed
            </Button>
          </Link>
        </div>
        
        {battles && battles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {battles.map((battle) => (
              <Link 
                key={battle.id} 
                href={`/battles/${battle.id}`}
                className="block"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/15 transition-all p-6 border border-white/5 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white">{battle.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(battle.status)}`}>
                      {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Created by {battle.profiles?.email?.split('@')[0] || 'Anonymous'}</p>
                    <p className="mt-1">Created on {new Date(battle.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 text-pink-400 text-sm font-medium">
                    Click to view details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No battles found</h3>
            <p className="text-gray-400 mb-6">
              {statusFilter 
                ? `There are no battles with ${statusFilter} status yet.`
                : "There are no battles yet."}
            </p>
            {isAdmin && (
              <Link href="/battles/create">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  Create a Battle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 