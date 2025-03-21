import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ShareableLink, StatusToggleButton } from "./components/client-components";
import { Button } from "@/components/ui/button";

// Server component
export default async function BattlePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get the battle
  const { data: battle, error } = await supabase
    .from("battles")
    .select("*")
    .eq("id", params.id)
    .single();
  
  if (error || !battle) {
    console.error("Error fetching battle:", error);
    return notFound();
  }
  
  // Check if the user is the creator of this battle
  const isCreator = battle.created_by === user.id;
  
  // Generate a shareable link
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareableLink = `${origin}/battles/${battle.id}/join`;
  
  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'collecting':
        return 'bg-gradient-to-r from-green-400 to-green-500';
      case 'voting':
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'completed':
        return 'bg-gradient-to-r from-purple-400 to-purple-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
      <Link href="/protected" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Profile
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">{battle.title}</h1>
        <div className={`px-4 py-2 rounded-full text-white font-bold ${getStatusColor(battle.status)}`}>
          {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:shadow-purple-500/20 transition-all">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Battle Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-purple-200/20 pb-2">
              <span className="text-lg text-purple-200">Created:</span>
              <span className="font-medium">{new Date(battle.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-purple-200/20 pb-2">
              <span className="text-lg text-purple-200">Status:</span>
              <span className="font-medium capitalize">{battle.status}</span>
            </div>
          </div>
        </div>
        
        {isCreator ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:shadow-pink-500/20 transition-all">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Admin Controls</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-purple-200">Shareable Link</h3>
                <ShareableLink url={shareableLink} />
                <p className="text-sm text-purple-300 mt-2">
                  Share this link with your friends to invite them to the battle
                </p>
              </div>
              
              <div className="pt-4 border-t border-purple-200/20">
                <StatusToggleButton status={battle.status} battleId={battle.id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:shadow-pink-500/20 transition-all">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Your Submission</h2>
            <p className="text-purple-200 mb-6">
              You haven't submitted a meme yet. Get creative and show off your meme skills!
            </p>
            <Button className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg transform hover:scale-105 transition-all shadow-md">
              Submit a Meme
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 