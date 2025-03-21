"use client"

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status on the client side
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          window.location.href = '/protected';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">MEME BATTLE</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/sign-in" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="meme-shape shape-1"></div>
          <div className="meme-shape shape-2"></div>
          <div className="meme-shape shape-3"></div>
          <div className="meme-shape shape-4"></div>
          <div className="meme-shape shape-5"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-purple-900/80 to-purple-950/80 z-10"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="flex flex-col items-center space-y-8">
            {/* Mascot */}
            <div className="relative w-36 h-36 mb-4 float">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-70"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 w-full h-full rounded-full flex items-center justify-center text-white text-5xl font-bold">
                MB
              </div>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"> MEME BATTLE</span>
              <span className="block text-2xl md:text-3xl font-medium text-purple-100 mt-4">Unleash Your Meme Creativity</span>
            </h1>
            
            <p className="mt-6 max-w-2xl text-xl text-purple-100">
              Create epic meme battles, invite your friends, and vote for the most hilarious creations. 
              Become the ultimate Meme Master!
            </p>
            
            {/* Battle Stats */}
            <div className="flex flex-wrap justify-center gap-8 my-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">1,243</span>
                <span className="text-purple-200">Battles Created</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">8,729</span>
                <span className="text-purple-200">Memes Submitted</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">423</span>
                <span className="text-purple-200">Meme Masters</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="mt-8">
              <Link href="/sign-in">
                <button className="group relative overflow-hidden px-10 py-6 text-xl font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/30">
                  <span className="relative z-10">START YOUR BATTLE</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                </button>
              </Link>
              <p className="mt-3 text-sm text-purple-300">No credit card required. Sign up in seconds.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
