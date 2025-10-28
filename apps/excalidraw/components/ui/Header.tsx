'use client'
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Plus, User } from "lucide-react";
import { Button } from './button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/actions';

export default function Header() {
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState<string | null>()
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const router = useRouter()
  console.log(roomName)
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      seterror("Room name is required");
      return;
    }
    setloading(true);
    seterror(null);
    try {
      const response = await createRoom(roomName)
      console.log(response)
      if (response.status) {
        router.push(`/canva/${response.room.id}`)
      } else if (response.status === false) {
        seterror("Fetching failed")
      }
      setRoomName("");
      setOpen(false);
      setloading(false);
    } catch (e) {
      seterror("Failed to create room");
      setloading(false);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">

      <div className='flex items-center'>
        <h1 className='font-semibold text-gray-700'>Home</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className='flex gap-2 items-center'>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Join Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Join an existing Room</DialogTitle>
                <DialogDescription>
                  Enter the name of the room you want to join.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <Input
                    id="room-name"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={loading}
                    className="mt-1"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Joining..." : "Join Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <span className='text-xl'>/</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Create a new Room</DialogTitle>
                <DialogDescription>
                  Enter a name for your new room. You can edit this later.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <Input
                    id="room-name"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={loading}
                    className="mt-1"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Creating..." : "Create Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <Avatar>
                <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="px-3 py-2 border-b">
              <div className="font-semibold text-sm">John Doe</div>
              <div className="text-xs text-gray-500">john@example.com</div>
            </div>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

