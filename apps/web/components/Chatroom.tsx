import axios from 'axios'
import React from 'react'
import ChatRoomClient from './ChatRoomClient'

async function Chatroom({
    roomId
}:{
    roomId:string
}) {
    const getmessage=async(roomId:string)=>{
        const msg=await axios.get(`http://backend:3001/chat/${roomId}`)
        return msg.data.message
    }

    const message=await getmessage(roomId)
  return (
    <ChatRoomClient messages={message} id={roomId}></ChatRoomClient>
  )
}

export default Chatroom