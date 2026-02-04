"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Badge } from "@/admin/components/ui/badge";
import { ScrollArea } from "@/admin/components/ui/scroll-area";
import { 
  twitchEmotes, 
  searchEmotes, 
  isValidEmoteUrl,
  type TwitchEmote 
} from "@/admin/data/twitch-emotes";
import { XIcon, PlusIcon, SearchIcon, LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/admin/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/admin/components/ui/tabs";
import type { PreviewEmote } from "@/shared/types";

interface EmotePickerProps {
  selectedEmotes: PreviewEmote[];
  onEmotesChange: (emotes: PreviewEmote[]) => void;
  maxEmotes?: number;
}

export function EmotePicker({ 
  selectedEmotes, 
  onEmotesChange, 
  maxEmotes = 10 
}: EmotePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [urlError, setUrlError] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "custom">("browse");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter emotes based on search query
  const filteredEmotes = searchEmotes(searchQuery);

  // Check if emote is already selected
  const isSelected = (emote: TwitchEmote) => 
    selectedEmotes.some(e => e.id === emote.id);

  // Add an emote to selection
  const addEmote = (emote: TwitchEmote | PreviewEmote) => {
    if (selectedEmotes.length >= maxEmotes) return;
    if (selectedEmotes.some(e => e.id === emote.id)) return;
    
    onEmotesChange([...selectedEmotes, {
      id: emote.id,
      name: emote.name,
      imageUrl: emote.imageUrl,
    }]);
  };

  // Remove an emote from selection
  const removeEmote = (emoteId: string) => {
    onEmotesChange(selectedEmotes.filter(e => e.id !== emoteId));
  };

  // Add custom URL emote
  const addCustomEmote = () => {
    if (!customUrl.trim()) {
      setUrlError("Please enter a URL");
      return;
    }

    if (!isValidEmoteUrl(customUrl)) {
      setUrlError("Please enter a valid emote URL from Twitch, 7TV, BTTV, or FFZ");
      return;
    }

    const name = customName.trim() || `Custom_${Date.now()}`;
    const newEmote: PreviewEmote = {
      id: `custom_${Date.now()}`,
      name,
      imageUrl: customUrl,
    };

    addEmote(newEmote);
    setCustomUrl("");
    setCustomName("");
    setUrlError("");
  };

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && activeTab === "browse") {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Preview Emotes</Label>
        <Badge variant="secondary" className="text-xs">
          {selectedEmotes.length}/{maxEmotes}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select emotes to use when previewing animations
      </p>

      {/* Selected emotes display */}
      <div className="flex flex-wrap gap-2 min-h-[44px] p-2 border rounded-md bg-muted/50">
        {selectedEmotes.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            No emotes selected - using default Kappa
          </span>
        ) : (
          selectedEmotes.map((emote) => (
            <div 
              key={emote.id} 
              className="relative group flex items-center gap-1 bg-background rounded-md px-2 py-1 border"
            >
              <img 
                src={emote.imageUrl} 
                alt={emote.name} 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/2.0';
                }}
              />
              <span className="text-xs max-w-[60px] truncate">{emote.name}</span>
              <button
                onClick={() => removeEmote(emote.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                aria-label={`Remove ${emote.name}`}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add emote dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={selectedEmotes.length >= maxEmotes}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Emote
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Preview Emote</DialogTitle>
            <DialogDescription>
              Search for Twitch emotes or add a custom emote URL
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "browse" | "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">
                <SearchIcon className="w-4 h-4 mr-2" />
                Browse Emotes
              </TabsTrigger>
              <TabsTrigger value="custom">
                <LinkIcon className="w-4 h-4 mr-2" />
                Custom URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4 mt-4">
              {/* Search input */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search emotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Emote grid */}
              <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="grid grid-cols-6 gap-2">
                  {filteredEmotes.map((emote) => {
                    const selected = isSelected(emote);
                    return (
                      <button
                        key={emote.id}
                        onClick={() => !selected && addEmote(emote)}
                        disabled={selected || selectedEmotes.length >= maxEmotes}
                        className={`
                          relative p-2 rounded-md border transition-all
                          hover:border-primary hover:bg-accent
                          focus:outline-none focus:ring-2 focus:ring-primary
                          ${selected ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'}
                        `}
                        title={emote.name}
                      >
                        <img
                          src={emote.imageUrl}
                          alt={emote.name}
                          className="w-8 h-8 mx-auto object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/2.0';
                          }}
                        />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                            <Badge variant="secondary" className="text-[10px]">Added</Badge>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {filteredEmotes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No emotes found for "{searchQuery}"
                  </div>
                )}
              </ScrollArea>

              <p className="text-xs text-muted-foreground text-center">
                Click an emote to add it to your preview selection
              </p>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customUrl">Emote URL</Label>
                <Input
                  id="customUrl"
                  type="url"
                  placeholder="https://static-cdn.jtvnw.net/emoticons/v2/..."
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setUrlError("");
                  }}
                />
                {urlError && (
                  <p className="text-xs text-destructive">{urlError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Supports Twitch, 7TV, BTTV, and FFZ emote URLs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customName">Emote Name (optional)</Label>
                <Input
                  id="customName"
                  type="text"
                  placeholder="My Custom Emote"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              {/* Preview */}
              {customUrl && isValidEmoteUrl(customUrl) && (
                <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-sm">{customName || "Custom Emote"}</span>
                </div>
              )}

              <Button 
                onClick={addCustomEmote} 
                className="w-full"
                disabled={!customUrl.trim() || selectedEmotes.length >= maxEmotes}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Custom Emote
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
