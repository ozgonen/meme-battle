"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Toast } from "@/components/toast-notification";

export function ShareableLink({ url }: { url: string }) {
  const [showToast, setShowToast] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  return (
    <>
      <div className="flex shadow-inner rounded-lg overflow-hidden">
        <input 
          type="text" 
          value={url} 
          readOnly 
          className="flex h-12 w-full rounded-l-lg bg-white/5 px-4 py-2 text-sm focus-visible:outline-none"
        />
        <Button 
          className="rounded-l-none h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
          onClick={handleCopy}
        >
          Copy
        </Button>
      </div>
      {showToast && (
        <Toast 
          message="Link copied to clipboard!" 
          type="success" 
        />
      )}
    </>
  );
}

export function StatusToggleButton({ 
  status, 
  battleId 
}: { 
  status: string; 
  battleId: string;
}) {
  const [showToast, setShowToast] = useState(false);
  
  const getButtonText = () => {
    switch(status) {
      case 'collecting':
        return "Start Voting Phase";
      case 'voting':
        return "End Battle & Show Results";
      case 'completed':
        return "View Final Results";
      default:
        return "Update Battle Status";
    }
  };
  
  const handleStatusChange = async () => {
    // This would typically call a server action to update the battle status
    // For now, we'll just show a toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  return (
    <>
      <Button 
        className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg transform hover:scale-105 transition-all shadow-md"
        onClick={handleStatusChange}
      >
        {getButtonText()}
      </Button>
      
      {showToast && (
        <Toast 
          message={`Status would change from ${status} to the next stage`} 
          type="info" 
        />
      )}
    </>
  );
} 