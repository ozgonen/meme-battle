import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Server action to create a new battle
async function createBattleAction(formData: FormData) {
  "use server";
  
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin - with error handling
  let isAdmin = false;
  try {
    // First check if the user_roles table exists
    const { error: tableError } = await supabase
      .from('user_roles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (!tableError) {
      // If table exists, check for role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      isAdmin = userRole?.role === 'admin';
    } else {
      console.error('Error checking user_roles table:', tableError);
      // Fallback to email check
      isAdmin = user.email === 'ozownz@gmail.com';
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Fallback to email check
    isAdmin = user.email === 'ozownz@gmail.com';
  }
  
  if (!isAdmin) {
    return redirect("/protected?message=You are not authorized to create battles&type=error");
  }
  
  // Get the title from the form
  const title = formData.get("title")?.toString().trim();
  
  if (!title) {
    return redirect("/battles/create?message=Title is required&type=error");
  }
  
  // Insert the battle into the database
  const { data, error } = await supabase
    .from("battles")
    .insert({
      title,
      created_by: user.id,
      status: "collecting"
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating battle:", error);
    return redirect("/battles/create?message=Failed to create battle&type=error");
  }
  
  // Redirect to the battle page
  return redirect(`/battles/${data.id}`);
}

type SearchParamsProps = {
  searchParams: { message?: string; type?: string };
};

export default async function CreateBattlePage({ searchParams }: SearchParamsProps) {
  const supabase = await createClient();
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin - with error handling
  let isAdmin = false;
  try {
    // First check if the table exists
    const { error: tableError } = await supabase
      .from('user_roles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (!tableError) {
      // If table exists, check for role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      isAdmin = userRole?.role === 'admin';
    } else {
      console.error('Error checking user_roles table:', tableError);
      // Fallback to email check
      isAdmin = user.email === 'ozownz@gmail.com';
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Fallback to email check
    isAdmin = user.email === 'ozownz@gmail.com';
  }
  
  if (!isAdmin) {
    return redirect("/protected?message=You are not authorized to create battles&type=error");
  }
  
  // Convert searchParams to Message format
  const message = searchParams?.message ? 
    { 
      [searchParams.type === 'error' ? 'error' : 'success']: searchParams.message 
    } as Message : 
    null;
  
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/protected" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Profile
        </Link>
        <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Create a Meme Battle</h1>
        <p className="text-purple-300 mt-2">As an admin, you have the exclusive ability to create new battles.</p>
      </div>
      
      <div className="max-w-md bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg">
        <form action={createBattleAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Battle Title</Label>
            <Input 
              id="title"
              name="title" 
              placeholder="Enter a title for your battle"
              required
              className="border-2 border-purple-300 focus:border-purple-500 rounded-lg p-3 text-lg"
            />
            <p className="text-sm text-purple-300">
              Choose something fun! This will be displayed to all participants.
            </p>
          </div>
          
          <SubmitButton 
            pendingText="Creating Battle..." 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all shadow-md"
          >
            Launch Battle 🚀
          </SubmitButton>
          
          <FormMessage message={message} />
        </form>
      </div>
    </div>
  );
} 