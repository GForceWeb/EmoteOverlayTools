"use client"

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/dialog";
import { Button } from "@/admin/components/ui/button";

export function CloseConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for close confirmation request from main process
    const unsubscribe = window.electronAPI?.onCloseConfirmation(() => {
      setIsOpen(true);
    });

    return unsubscribe;
  }, []);

  const handleConfirmQuit = async () => {
    try {
      await window.electronAPI?.confirmQuit();
    } catch (error) {
      console.error("Failed to quit application:", error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Exit</DialogTitle>
          <DialogDescription>
            Are you sure you want to exit Emote Overlay Tools? The application will close completely.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmQuit}>
            Exit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
