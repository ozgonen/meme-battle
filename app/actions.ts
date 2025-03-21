"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return encodedRedirect("error", "/forgot-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for the password reset link",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;
  const supabase = await createClient();

  if (password !== passwordConfirm) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return encodedRedirect("error", "/reset-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-in",
    "Password updated successfully. Please sign in.",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    return encodedRedirect("error", "/sign-in", "Error signing in with Google");
  }

  return redirect(data.url);
};

// Battle management actions

export const updateBattleStatusAction = async (battleId: string) => {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }
  
  // Get the battle
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .single();
  
  if (battleError || !battle) {
    console.error("Error fetching battle:", battleError);
    return { error: "Battle not found" };
  }
  
  // Check if the user is the creator of this battle or an admin
  const isCreator = battle.created_by === user.id;
  
  // Check if user is admin
  let isAdmin = false;
  try {
    // Fallback to email check first
    isAdmin = user.email === 'ozownz@gmail.com';
    
    // Check from user_roles if exists
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!roleError && userRole?.role === 'admin') {
      isAdmin = true;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  if (!isCreator && !isAdmin) {
    return { error: "Not authorized to update this battle" };
  }
  
  // Determine the next status
  let nextStatus: string;
  switch(battle.status) {
    case 'collecting':
      nextStatus = 'voting';
      break;
    case 'voting':
      nextStatus = 'completed';
      break;
    case 'completed':
      return { error: "Battle is already completed" };
    default:
      nextStatus = 'collecting';
  }
  
  // Update the battle status
  const { error: updateError } = await supabase
    .from("battles")
    .update({ status: nextStatus })
    .eq("id", battleId);
  
  if (updateError) {
    console.error("Error updating battle status:", updateError);
    return { error: "Failed to update battle status" };
  }
  
  return { success: true, newStatus: nextStatus };
};

export const deleteBattleAction = async (battleId: string) => {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }
  
  // Get the battle
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .single();
  
  if (battleError || !battle) {
    console.error("Error fetching battle:", battleError);
    return { error: "Battle not found" };
  }
  
  // Check if the user is the creator of this battle or an admin
  const isCreator = battle.created_by === user.id;
  
  // Check if user is admin
  let isAdmin = false;
  try {
    // Fallback to email check first
    isAdmin = user.email === 'ozownz@gmail.com';
    
    // Check from user_roles if exists
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!roleError && userRole?.role === 'admin') {
      isAdmin = true;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  if (!isCreator && !isAdmin) {
    return { error: "Not authorized to delete this battle" };
  }
  
  // First delete related records (participants and any submissions)
  // This is necessary to maintain referential integrity
  await supabase.from("participants").delete().eq("battle_id", battleId);
  await supabase.from("submissions").delete().eq("battle_id", battleId);
  await supabase.from("votes").delete().eq("battle_id", battleId);
  
  // Then delete the battle
  const { error: deleteError } = await supabase
    .from("battles")
    .delete()
    .eq("id", battleId);
  
  if (deleteError) {
    console.error("Error deleting battle:", deleteError);
    return { error: "Failed to delete battle" };
  }
  
  return { success: true };
};
