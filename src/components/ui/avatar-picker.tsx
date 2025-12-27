"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

// Collection of fun avatar options
const AVATAR_COLLECTION = [
  // Animals
  { id: "bear", emoji: "🐻", label: "Bear", color: "bg-amber-100" },
  { id: "cat", emoji: "🐱", label: "Cat", color: "bg-orange-100" },
  { id: "dog", emoji: "🐶", label: "Dog", color: "bg-yellow-100" },
  { id: "fox", emoji: "🦊", label: "Fox", color: "bg-orange-100" },
  { id: "lion", emoji: "🦁", label: "Lion", color: "bg-amber-100" },
  { id: "panda", emoji: "🐼", label: "Panda", color: "bg-gray-100" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit", color: "bg-pink-100" },
  { id: "koala", emoji: "🐨", label: "Koala", color: "bg-gray-100" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn", color: "bg-purple-100" },
  { id: "owl", emoji: "🦉", label: "Owl", color: "bg-amber-100" },
  { id: "penguin", emoji: "🐧", label: "Penguin", color: "bg-slate-100" },
  { id: "frog", emoji: "🐸", label: "Frog", color: "bg-green-100" },
  // Space & Nature
  { id: "star", emoji: "⭐", label: "Star", color: "bg-yellow-100" },
  { id: "rocket", emoji: "🚀", label: "Rocket", color: "bg-blue-100" },
  { id: "planet", emoji: "🪐", label: "Planet", color: "bg-purple-100" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow", color: "bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100" },
  { id: "sun", emoji: "☀️", label: "Sun", color: "bg-yellow-100" },
  { id: "moon", emoji: "🌙", label: "Moon", color: "bg-indigo-100" },
  { id: "flower", emoji: "🌸", label: "Flower", color: "bg-pink-100" },
  { id: "tree", emoji: "🌳", label: "Tree", color: "bg-green-100" },
  // Fun
  { id: "robot", emoji: "🤖", label: "Robot", color: "bg-slate-100" },
  { id: "alien", emoji: "👽", label: "Alien", color: "bg-green-100" },
  { id: "superhero", emoji: "🦸", label: "Hero", color: "bg-red-100" },
  { id: "wizard", emoji: "🧙", label: "Wizard", color: "bg-purple-100" },
];

interface AvatarPickerProps {
  currentAvatar?: string | null;
  displayName?: string;
  onSelect: (avatarId: string) => void;
  children?: React.ReactNode;
}

export function AvatarPicker({
  currentAvatar,
  displayName,
  onSelect,
  children,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentAvatar);

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId);
    onSelect(avatarId);
    setOpen(false);
  };

  const currentAvatarData = AVATAR_COLLECTION.find((a) => a.id === currentAvatar);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Camera className="h-4 w-4" />
            Change Avatar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Pick a fun avatar to represent you in the app
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 py-4">
          {AVATAR_COLLECTION.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-lg transition-all",
                avatar.color,
                "hover:ring-2 hover:ring-primary hover:ring-offset-2",
                selected === avatar.id && "ring-2 ring-primary ring-offset-2"
              )}
              title={avatar.label}
            >
              <span className="text-2xl">{avatar.emoji}</span>
              {selected === avatar.id && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">Preview:</div>
          <Avatar className="h-16 w-16">
            {selected ? (
              <AvatarFallback
                className={cn(
                  "text-3xl",
                  AVATAR_COLLECTION.find((a) => a.id === selected)?.color
                )}
              >
                {AVATAR_COLLECTION.find((a) => a.id === selected)?.emoji}
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {displayName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to get avatar data by ID
export function getAvatarById(id: string | null | undefined) {
  if (!id) return null;
  return AVATAR_COLLECTION.find((a) => a.id === id);
}

// Export the collection for use in other components
export { AVATAR_COLLECTION };
