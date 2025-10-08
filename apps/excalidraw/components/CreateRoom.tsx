"use client";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRoomName("");
      setOpen(false);
      setLoading(false);
    } catch (e) {
      setError("Failed to create room");
      setLoading(false);
    }
  };

  return (
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
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => {
                setRoomName("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </DialogClose>
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
  );
}

