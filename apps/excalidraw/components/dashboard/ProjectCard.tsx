'use client'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, MoreVertical, Trash2, Folder, Plus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createRoom, DeleteRoom, getRooms, updatefavorite } from '@/actions';
import { Spinner } from '../ui/spinner';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';
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

function ProjectCard({ room, userId, favrooms }: { room: any, userId: string, favrooms: any[] | null }) {
  const router = useRouter();
  const isfav = favrooms?.some((rm) => rm.id === room.id) ?? false;

  const deleteRoom=async()=>{
    const Delete=await DeleteRoom(room.id)
    console.log(Delete)
  }

  const update=async()=>{
    const updatefav=await updatefavorite(userId,room.id,!isfav)
    console.log(updatefav)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-72 flex flex-col">
      {/* Drawing board image */}
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
        {/* Replace with actual image */}
        <img
          src={`${room?.photo}`}
          alt="Drawing Board"
          className="object-cover w-full h-full hover:cursor-pointer"
          onClick={() => router.push(`/canva/${room?.id}`)}
        />
      </div>
      {/* Card footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="block text-md font-semibold text-gray-600 truncate">
          {`${room?.slug}`}
        </span>
        <div className='flex justify-center items-center gap-1'>
          <Button variant="ghost" size="icon" className="p-2" onClick={()=> update()}>
            <Star
              className="w-4 h-4"
              color={isfav ? "#FFD700" : "#fff"}
              fill={isfav ? "#FFD700" : "#fff"}
              style={{ stroke: isfav ? "#FFD700" : "#ccc", strokeWidth: 2 }}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="text-red-600 flex items-center gap-2 cursor-pointer" onClick={()=>deleteRoom()}>
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
enum tabs {
  all, my, joined, fav
}
export default function ProjectSection() {
  const [Rooms, setRooms] = useState<any[]>([])
  const [userId, setuserId] = useState<string>("")
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState<string | null>(null)
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState<string>("");
  const [fav, setfav] = useState<any[]>([])
  const [memberRoom, setmemberRoom] = useState<any[]>([])
  const [Tab, setTab] = useState<tabs>(tabs.all)
  const [roomfilter, setroomfilter] = useState<any[]>([])
  const [CreatedRoom, setCreatedRoom] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const getroom = async () => {
      setloading(true)
      seterror(null)
      try {
        const response = await getRooms()
        if (response.status) {
          setRooms(response?.myallrooms ?? [])
          setuserId(response.userId || '')
          setfav(response?.favrooms ?? [])
          setmemberRoom(response?.memberroom ?? [])
          setCreatedRoom(response?.mycreatedrooms ?? [])
          setroomfilter(response?.myallrooms)
        } else if (response.status === false) {
          seterror("Fetching failed")
        }
        setloading(false)
      } catch (error) {
        seterror("Fetching failed")
        setloading(false)
      }
    }
    getroom()

  }, [])
  // console.log(fav)
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      seterror("Room name is required");
      return;
    }
    setloading(true);
    seterror(null);
    try {
      const response = await createRoom(roomName)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[60vh]">
        <div className="bg-gray-200/20 rounded-lg shadow-lg flex flex-col items-center justify-center p-8 mb-4 w-1/3">
          {/* Shapes illustration */}
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            className="mb-4"
            style={{
              transform: 'translateX(-40px)',
              opacity: 0,
              animation: 'slideInLeft 0.7s cubic-bezier(0.4,0,0.2,1) forwards'
            }}
          >
            {/* Rectangle */}
            <rect x="5" y="10" width="35" height="25" rx="4" fill="#4F46E5" opacity="0.8" />
            {/* Circle */}
            <ellipse cx="70" cy="22" rx="13" ry="13" fill="#22D3EE" opacity="0.8" />
            {/* Line */}
            <line x1="90" y1="45" x2="115" y2="15" stroke="#F59E42" strokeWidth="4" strokeLinecap="round" />
            {/* Pencil (squiggle) */}
            <polyline points="15,50 25,55 35,50 45,55 55,50" fill="none" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <style>
            {`
                @keyframes slideInLeft {
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
              `}
          </style>
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium text-gray-900 mb-2">Loading</span>
            <div className="mt-1">
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (Rooms.length === 0) {
    return (
      <div className='w-full h-[60vh] flex justify-center items-center'>
        <div className='px-2 py-2 w-1/3 bg-gray-200/20 rounded-lg shadow-lg'>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder />
              </EmptyMedia>
              <EmptyTitle>No Projects Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any projects yet. Get started by creating
                your first project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
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
            </EmptyContent>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap flex-col gap-2 py-8 px-4">
      <div className="flex flex-row gap-2 text-sm">
        <button
          className={`px-4 py-1 rounded-2xl border hover:cursor-pointer ${Tab === tabs.all ? "bg-black text-white" : "bg-white text-gray-600"}`}
          onClick={() => {setTab(tabs.all) ; setroomfilter(Rooms)}}
        >
          All
        </button>
        <button
          className={`px-4 py-1 rounded-2xl border hover:cursor-pointer ${Tab === tabs.my ? "bg-black text-white" : "bg-white text-gray-600"}`}
          onClick={() => {setTab(tabs.my); setroomfilter(CreatedRoom)} }
        >
          My Rooms
        </button>
        <button
          className={`px-4 py-1 rounded-2xl border hover:cursor-pointer ${Tab === tabs.joined ? "bg-black text-white" : "bg-white text-gray-600"}`}
          onClick={() => {setTab(tabs.joined) ; setroomfilter(memberRoom)}}
        >
          Joined Rooms
        </button>
        <button
          className={`px-4 py-1 rounded-2xl border hover:cursor-pointer ${Tab === tabs.fav ? "bg-black text-white" : "bg-white text-gray-600"}`}
          onClick={() => {setTab(tabs.fav) ; setroomfilter(fav)}}
        >
          Favorite Rooms
        </button>
      </div>
      <div className='flex flex-wrap gap-6 py-4 px-4'>
        {roomfilter.map((room, idx) => (
          <ProjectCard room={room} userId={userId} key={idx} favrooms={fav} />
        ))}
      </div>
    </div>
  )
}
