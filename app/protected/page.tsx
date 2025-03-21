import { UserProfile } from "@/components/user-profile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";

// For Next.js 14+, searchParams is a ReadonlyURLSearchParams object
export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      // Table doesn't exist - you need to run the SQL queries from RBAC-MANUAL-SETUP.md
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  // For email-based admin check (fallback)
  const isAdminByEmail = user.email === 'ozownz@gmail.com';
  isAdmin = isAdmin || isAdminByEmail;
  
  // Get message from query params - handle as simple object, not promise
  const messageType = searchParams.type as string | undefined;
  const messageText = searchParams.message as string | undefined;
  
  const message = messageText
    ? {
        [messageType === 'error' ? 'error' : 'success']: messageText,
      } as Message
    : null;

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-4xl mx-auto py-8 px-4">
      <div className="w-full flex justify-between items-start">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <form action={signOutAction}>
          <Button variant="outline" type="submit" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
            Logout
          </Button>
        </form>
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
    </div>
  );
}
