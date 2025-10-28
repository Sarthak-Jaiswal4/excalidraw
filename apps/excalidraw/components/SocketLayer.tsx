'use client'
import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { updatemember } from '@/actions'

function SocketLayer({roomId}:{roomId:string}) {
    const [socket, setsocket] = useState<WebSocket|null>(null)

    useEffect(() => {
        try {
          const ws=new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDFiNjNjYi1mZDMzLTRiZTMtYjU3ZS02MjM1Nzc2NWY4MWUiLCJpYXQiOjE3NTk5NDAxNTB9.bLVtGH90Q30jeqdBF_KK8Q0sdtBnsBO0YCcvWunHtKc")
          ws.onopen=()=>{
            setsocket(ws)
            ws.send(JSON.stringify({
              type:"join_room",
              room:Number(roomId)
            }))
          }
        } catch (error) {
          console.log("Error in connecting frontend to websocket")
        }
    }, [])

    useEffect(() => {
      const updateroommember=async()=>{
        const update=await updatemember(roomId)
        console.log(update)
      }
      updateroommember()
    }, [])
    
    if(socket==null){
      return (
        <h1>Connecting.....</h1>
      )
    }

  return (
    <Canvas roomId={roomId} socket={socket} />
  )
}

export default SocketLayer