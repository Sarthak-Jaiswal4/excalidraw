'use client'
import React, { useEffect, useState } from 'react'
import { useSocket } from '../hook/usesocket'

function ChatRoomClient({
    messages,id
}:{
    messages:{message:string}[],
    id:string
}) { 
    const [text, settext] = useState("")
    const [msg, setmsg] = useState(messages)
    const {loading,socket}=useSocket()
    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type:"join_room",
                room:id
            }))
            socket.onmessage=(e)=>{
                const parsedData=JSON.parse(e.data)
                if(parsedData.type==="chat"){
                    console.log(parsedData)
                    setmsg(e => [...e,{message:parsedData.message}])
                }
            }
        }
    },[loading,socket,id])
    console.log(msg)
  return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
      {msg.map((m, idx) => (
        <div key={idx} style={{ marginBottom: '0.5rem' }}>
          {m.message}
        </div>
      ))}
    </div>
    <input
      type="text"
      placeholder="Type your message..."
      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
      onChange={(e)=>settext(e.target.value)}
    />
    <button
    onClick={()=>{
        socket?.send(JSON.stringify({
            type:"chat",
            room:id,
            message:text
        }))
    }}
    >submit</button>
  </div>
  )
}

export default ChatRoomClient