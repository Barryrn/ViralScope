"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconBrandYoutube,
  IconSearch,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface YouTubeInputProps {
  onSubmit: (input: string) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
}

export function YouTubeInput({ onSubmit, isLoading, onReset }: YouTubeInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("youtube.input");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await onSubmit(input);
  };

  const handleClear = () => {
    setInput("");
    onReset();
    inputRef.current?.focus();
  };

  // Keyboard shortcut: Cmd/Ctrl + K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="group relative">
        {/* Animated gradient border on focus */}
        <div
          className={cn(
            "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-red-500 opacity-0 blur transition-all duration-500",
            isFocused && "opacity-75",
            isLoading && "animate-pulse opacity-100"
          )}
        />

        <div className="relative flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
          {/* YouTube icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20">
            <IconBrandYoutube className="h-5 w-5 text-red-500" />
          </div>

          {/* Input field */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("placeholder")}
            className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 md:text-lg"
            disabled={isLoading}
          />

          {/* Clear button */}
          {input && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "relative h-10 shrink-0 gap-2 overflow-hidden rounded-lg px-4 font-medium transition-all",
              "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg",
              "hover:from-red-600 hover:to-pink-600 hover:shadow-red-500/25",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <IconSearch className="h-4 w-4" />
                <span className="hidden sm:inline">Analyze</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Input hints */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <InputHint>youtube.com/watch?v=...</InputHint>
        <InputHint>youtu.be/...</InputHint>
        <InputHint>@channelname</InputHint>
        <InputHint>search keywords</InputHint>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ⌘
          </kbd>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            K
          </kbd>
          <span className="ml-1">to focus</span>
        </span>
      </div>
    </form>
  );
}

function InputHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2.5 py-1 transition-colors hover:bg-muted">
      {children}
    </span>
  );
}
