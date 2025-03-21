"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Toast } from "@/components/toast-notification";
import { updateBattleStatusAction, deleteBattleAction } from "@/app/actions";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();
  
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
    setIsLoading(true);
    try {
      const result = await updateBattleStatusAction(battleId);
      
      if (result && 'error' in result) {
        setMessage({ text: result.error || 'Error updating battle', type: 'error' });
      } else if (result) {
        setMessage({ 
          text: `Battle status updated to ${result.newStatus || 'next phase'}`, 
          type: 'success' 
        });
        // Refresh the page to show the updated status
        router.refresh();
      }
    } catch (error) {
      setMessage({ 
        text: 'An unexpected error occurred', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  return (
    <div className="space-y-4">
      <Button 
        className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg transform hover:scale-105 transition-all shadow-md"
        onClick={handleStatusChange}
        disabled={isLoading || status === 'completed'}
      >
        {isLoading ? 'Updating...' : getButtonText()}
      </Button>
      
      {message && (
        <Toast 
          message={message.text} 
          type={message.type} 
        />
      )}
    </div>
  );
}

export function DeleteBattleButton({ battleId }: { battleId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();
  
  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await deleteBattleAction(battleId);
      
      if (result && 'error' in result) {
        setMessage({ text: result.error || 'Error deleting battle', type: 'error' });
        setShowConfirm(false);
      } else {
        setMessage({ text: 'Battle deleted successfully', type: 'success' });
        // Redirect to profile page after a short delay
        setTimeout(() => router.push('/protected'), 1500);
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  return (
    <div className="space-y-4">
      <Button 
        variant="destructive"
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {isLoading ? 'Deleting...' : showConfirm ? 'Confirm Delete' : 'Delete Battle'}
      </Button>
      
      {showConfirm && !isLoading && (
        <p className="text-xs text-red-400 text-center">
          This action cannot be undone. Click again to confirm.
        </p>
      )}
      
      {message && (
        <Toast 
          message={message.text} 
          type={message.type} 
        />
      )}
    </div>
  );
} 