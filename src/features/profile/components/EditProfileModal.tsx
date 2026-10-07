
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/apiClient';
import React, { useState, useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';
import { RefreshCw, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  userId: string;
}

const AVATAR_STYLES = ['adventurer', 'bottts', 'micah', 'pixel-art', 'notionists'];

export function EditProfileModal({ isOpen, onClose, userData, userId }: EditProfileModalProps) {
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('adventurer');
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    photoURL: userData?.photoURL || '',
    bio: userData?.bio || ''
  });

  // Sync with userData if it changes (e.g. initial load) or when modal opens
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        photoURL: userData.photoURL || '',
        bio: userData.bio || ''
      });
    }
  }, [userData, isOpen]);

  const handleRegenerate = () => {
    const seed = Math.random().toString(36).substring(7);
    const newUrl = `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=${seed}`;
    setFormData({ ...formData, photoURL: newUrl });
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      
      await apiClient.put('/profile', formData).catch(() => {});
      
      toast({
        title: "Profile Updated",
        description: "Your explorer credentials have been synchronized.",
      });
      onClose();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not sync data with the core server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card bg-slate-900 border-indigo-500/20 text-slate-200 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">Edit Explorer Profile</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your identity within the Algo Vista universe.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-indigo-500/50 shadow-xl overflow-hidden">
                {formData.photoURL ? (
                  <AvatarImage src={formData.photoURL} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-slate-800">
                  <User className="text-slate-600" size={40} />
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={handleRegenerate}
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg z-20"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {AVATAR_STYLES.map(style => (
                <Button 
                  key={style}
                  size="sm"
                  variant={currentStyle === style ? "default" : "outline"}
                  onClick={() => setCurrentStyle(style)}
                  className="text-[10px] uppercase font-bold px-2 h-7 border-white/10"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-indigo-400 uppercase font-black text-[10px] tracking-widest">Username</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-black/40 border-white/5 focus:border-indigo-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-indigo-400 uppercase font-black text-[10px] tracking-widest">Avatar URL</Label>
            <Input 
              id="photo" 
              value={formData.photoURL} 
              onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
              placeholder="https://..."
              className="bg-black/40 border-white/5 focus:border-indigo-500/50 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-indigo-400 uppercase font-black text-[10px] tracking-widest">Explorer Bio</Label>
            <Textarea 
              id="bio" 
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="bg-black/40 border-white/5 focus:border-indigo-500/50 h-24 resize-none text-sm"
              placeholder="Tell us about your mission..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-white">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 font-bold uppercase italic px-8"
          >
            {loading ? "Synchronizing..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
