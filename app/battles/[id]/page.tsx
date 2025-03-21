import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ShareableLink, StatusToggleButton, DeleteBattleButton } from "./components/client-components";

export default async function BattlePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient();
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  const { data: battle, error } = await supabase
    .from('battles')
    .select('*, profiles(email)')
    .eq('id', params.id)
    .single();
  
  if (error || !battle) {
    return notFound();
  }
  
  const isCreator = battle.created_by === user.id;
  const shareableUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/battles/${battle.id}/join`;
  
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
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-extrabold text-white">{battle.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(battle.status)}`}>
                {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Created by {battle.profiles?.email?.split('@')[0] || 'Anonymous'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Share this battle</h2>
            <ShareableLink url={shareableUrl} />
          </div>
          
          {/* Battle Content - Will be implemented in future milestones */}
          <div className="min-h-[200px] rounded-lg bg-white/5 p-4 flex items-center justify-center">
            <p className="text-gray-400 text-center">
              {battle.status === 'collecting' && "Waiting for participants to join and submit their memes..."}
              {battle.status === 'voting' && "Voting is in progress! Cast your votes for the best memes."}
              {battle.status === 'completed' && "This battle has concluded. View the results below!"}
            </p>
          </div>
          
          {isCreator && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h2 className="text-xl font-semibold text-white">Admin Controls</h2>
              <StatusToggleButton status={battle.status} battleId={battle.id} />
              <DeleteBattleButton battleId={battle.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 