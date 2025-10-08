'use client'

import { useEffect, useState } from "react"

export function useSocket(){
    const [loading, setloading] = useState(true)
    const [socket, setsocket] = useState<WebSocket>()

    useEffect(() => {
        const ws=new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZjEyYjFlMC03OWMwLTQ0ZmUtYjllMC1iZWQ4NjgzNGI2YmMiLCJpYXQiOjE3NTc5NTU4MzV9.y4Y7iLYUX3es5XXi7bDTK68380eKYBqAQHF3io-RB-c")
        ws.onopen=()=>{
            setloading(false)
            setsocket(ws)
        }
    }, [])
    
    return{
        loading,socket
    }
}