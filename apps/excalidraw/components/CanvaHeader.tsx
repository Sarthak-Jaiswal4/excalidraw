'use client'
import React from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Copy, Share2 } from "lucide-react";

const CanvaHeader = ({ fileName = "Untitled Canvas" }: { fileName?: string }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link.");
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm relative z-20">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <div className="text-lg font-semibold text-gray-800">{fileName}</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <Share2 />
              </svg>
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default CanvaHeader;

