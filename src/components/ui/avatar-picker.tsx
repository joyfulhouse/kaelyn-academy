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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

// Collection of fun avatar options with semantic color tokens
const AVATAR_COLLECTION = [
  // Animals
  { id: "bear", emoji: "🐻", label: "Bear", color: "bg-warning/20" },
  { id: "cat", emoji: "🐱", label: "Cat", color: "bg-warning/30" },
  { id: "dog", emoji: "🐶", label: "Dog", color: "bg-warning/15" },
  { id: "fox", emoji: "🦊", label: "Fox", color: "bg-warning/30" },
  { id: "lion", emoji: "🦁", label: "Lion", color: "bg-warning/20" },
  { id: "panda", emoji: "🐼", label: "Panda", color: "bg-muted" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit", color: "bg-destructive/10" },
  { id: "koala", emoji: "🐨", label: "Koala", color: "bg-muted" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn", color: "bg-primary/20" },
  { id: "owl", emoji: "🦉", label: "Owl", color: "bg-warning/20" },
  { id: "penguin", emoji: "🐧", label: "Penguin", color: "bg-muted" },
  { id: "frog", emoji: "🐸", label: "Frog", color: "bg-success/20" },
  // Space & Nature
  { id: "star", emoji: "⭐", label: "Star", color: "bg-warning/15" },
  { id: "rocket", emoji: "🚀", label: "Rocket", color: "bg-info/20" },
  { id: "planet", emoji: "🪐", label: "Planet", color: "bg-primary/20" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow", color: "bg-gradient-to-r from-destructive/10 via-warning/10 to-info/10" },
  { id: "sun", emoji: "☀️", label: "Sun", color: "bg-warning/15" },
  { id: "moon", emoji: "🌙", label: "Moon", color: "bg-info/30" },
  { id: "flower", emoji: "🌸", label: "Flower", color: "bg-destructive/10" },
  { id: "tree", emoji: "🌳", label: "Tree", color: "bg-success/20" },
  // Fun
  { id: "robot", emoji: "🤖", label: "Robot", color: "bg-muted" },
  { id: "alien", emoji: "👽", label: "Alien", color: "bg-success/20" },
  { id: "superhero", emoji: "🦸", label: "Hero", color: "bg-destructive/20" },
  { id: "wizard", emoji: "🧙", label: "Wizard", color: "bg-primary/20" },
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
