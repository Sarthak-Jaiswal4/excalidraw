import axios from 'axios'
import React from 'react'
import Chatroom from '../../../components/Chatroom'

export default async function ChatRoom({
    params
}:{
    params: Promise<{ slug: string }>
}) {
    const {slug}=await params

    const getroom=async(slug:string)=>{
      const room =await axios.get(`http://localhost:3001/room/${slug}`)
      return room.data.room.id
    }

    const roomId=await getroom(slug)

  return (
    <Chatroom roomId={roomId}/>
  )
}
