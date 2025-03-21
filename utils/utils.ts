import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export interface Message {
  error?: string;
  success?: string;
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} pathname - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 */
export function encodedRedirect(
  type: "error" | "success",
  pathname: string,
  message: string,
) {
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  searchParams.set("message", message);
  return { pathname, searchParams: searchParams.toString() };
}

// Reusable function to check if a user is an admin
export async function isUserAdmin(userId: string, userEmail?: string | null) {
  const supabase = await createClient();
  
  let isAdmin = false;
  
  // First try to check the user_roles table
  try {
    // Check if the user_roles table exists and has records
    const { error: tableError } = await supabase
      .from('user_roles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (!tableError) {
      // If table exists, check for role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      isAdmin = userRole?.role === 'admin';
    }
  } catch (error) {
    console.error('Error checking admin status in user_roles:', error);
  }
  
  // Fallback to email check if not admin yet
  if (!isAdmin && userEmail) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['ozownz@gmail.com'];
    isAdmin = adminEmails.includes(userEmail.toLowerCase());
  }
  
  return isAdmin;
}
