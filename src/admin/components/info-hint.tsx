import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/admin/lib/utils";

interface InfoHintProps {
  text: string;
  className?: string;
}

const TOOLTIP_WIDTH = 224; // w-56
const VIEWPORT_PAD = 8;

/** Compact “i” icon with hover tooltip for field help. */
export function InfoHint({ text, className }: InfoHintProps) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PAD)
    );

    const below = rect.bottom + 6;
    const estimatedHeight = 72;
    const top =
      below + estimatedHeight > window.innerHeight - VIEWPORT_PAD
        ? Math.max(VIEWPORT_PAD, rect.top - estimatedHeight - 6)
        : below;

    setCoords({ top, left });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onReposition = () => updatePosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updatePosition]);

  return (
    <span className={cn("inline-flex", className)}>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/80 bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={text}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <Info className="h-2.5 w-2.5" aria-hidden />
      </button>

      {open &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: TOOLTIP_WIDTH,
            }}
            className="z-[200] rounded-md border border-border/80 bg-popover px-2.5 py-2 text-left text-[11px] leading-snug text-popover-foreground shadow-lg shadow-black/40"
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
