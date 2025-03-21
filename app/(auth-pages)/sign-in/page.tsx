"use client"

import { signInWithGoogleAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Login({ searchParams }: { searchParams: any }) {
  const [message, setMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    if (searchParams?.message) {
      setMessage({ message: searchParams.message });
    } else if (searchParams?.error) {
      setMessage({ error: searchParams.error });
    } else if (searchParams?.success) {
      setMessage({ success: searchParams.success });
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-purple-950 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="meme-shape shape-1"></div>
        <div className="meme-shape shape-2"></div>
        <div className="meme-shape shape-3"></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-purple-900/80 to-purple-950/80 z-0"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0 mx-auto">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-8 shadow-2xl border border-white/10 animate-in">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="mb-6 text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              MEME BATTLE
            </Link>
            
            <div className="relative w-24 h-24 mb-6 float">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-70"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold">
                MB
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome!</h1>
            <p className="text-purple-200 max-w-xs">
              Sign in to create meme battles, challenge your friends, and climb the leaderboard!
            </p>
          </div>
        
          <form action={signInWithGoogleAction} className="space-y-6">
            <button
              type="submit"
              className="w-full relative group overflow-hidden flex items-center justify-center gap-3 h-14 px-6 rounded-xl bg-white text-gray-700 font-medium shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              "error" in message ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"
            }`}>
              {"error" in message ? message.error : "success" in message ? message.success : message.message}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-purple-200">
              By signing in, you agree to our
              <a href="#" className="text-pink-400 hover:text-pink-300 ml-1">Terms of Service</a>
              <span className="mx-1">and</span>
              <a href="#" className="text-pink-400 hover:text-pink-300">Privacy Policy</a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-300 hover:text-white transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
