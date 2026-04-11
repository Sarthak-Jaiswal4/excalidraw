'use client'
import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { updatemember } from '@/actions'

function SocketLayer({ roomId, token }: { roomId: string, token: string }) {
  const [socket, setsocket] = useState<WebSocket | null>(null)
  const IP = process.env.WS_URL
  console.log(IP)

  useEffect(() => {
    let ws: WebSocket;
    try {
          ws=new WebSocket(`https://excaliadrw-ws-backend.onrender.com/token=${token}`)
      console.log(ws)
      ws.onopen = () => {
        setsocket(ws)
        ws.send(JSON.stringify({
          type: "join_room",
          room: Number(roomId)
        }))
      }
    } catch (error) {
      console.log("Error in connecting frontend to websocket")
    }

    return () => {
      if (ws) {
        ws.close();
      }
    }
  }, [roomId])

  useEffect(() => {
    const updateroommember = async () => {
      const update = await updatemember(roomId)
      console.log(update)
    }
    updateroommember()
  }, [])

  if (socket == null) {
    return (
      <h1>Connecting.....</h1>
    )
  }

  return (
    <Canvas roomId={roomId} socket={socket} />
  )
}

export default SocketLayer