import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

// Server action to join a battle
async function joinBattleAction(battleId: string) {
  "use server";
  
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if the battle exists
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .single();
  
  if (battleError || !battle) {
    console.error("Error fetching battle:", battleError);
    return redirect(`/battles/${battleId}/join?message=Battle not found&type=error`);
  }
  
  // Check if user is already a participant
  const { data: existingParticipant, error: participantError } = await supabase
    .from("participants")
    .select("*")
    .eq("battle_id", battleId)
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (!participantError && existingParticipant) {
    // User is already a participant, redirect to battle page
    return redirect(`/battles/${battleId}`);
  }
  
  // Add user as a participant
  const { error: insertError } = await supabase
    .from("participants")
    .insert({
      battle_id: battleId,
      user_id: user.id
    });
  
  if (insertError) {
    console.error("Error joining battle:", insertError);
    return redirect(`/battles/${battleId}/join?message=Failed to join battle&type=error`);
  }
  
  // Redirect to the battle page
  return redirect(`/battles/${battleId}`);
}

export default async function JoinBattlePage({ params }: { params: { id: string } }) {
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
  
  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from("participants")
    .select("*")
    .eq("battle_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (existingParticipant) {
    return redirect(`/battles/${params.id}`);
  }
  
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">Join Meme Battle</h1>
      
      <div className="bg-card border rounded-lg p-6 max-w-md w-full my-8">
        <h2 className="text-xl font-semibold mb-4">{battle.title}</h2>
        <p className="text-muted-foreground mb-6">
          You've been invited to join this meme battle. Click the button below to join and submit your meme.
        </p>
        
        <form action={() => joinBattleAction(params.id)}>
          <Button type="submit" className="w-full">
            Join This Battle
          </Button>
        </form>
      </div>
    </div>
  );
} 