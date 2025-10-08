'use client'
import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [roomId, setroomId] = useState<string>("")
  const router=useRouter()
  console.log(roomId)
  return (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
    <input
      type="text"
      placeholder="Enter room name"
      onChange={(e)=> setroomId(e.target.value)}
      style={{
        padding: "0.5rem 1rem",
        fontSize: "1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        marginBottom: "1rem",
        width: "250px",
        boxSizing: "border-box"
      }}
    />
    <button
      onClick={() => router.push(`/room/${roomId}`)}
      style={{
        fontSize: "1.25rem",
        padding: "0.75rem 2rem",
        borderRadius: "6px",
        border: "none",
        background: "#0070f3",
        color: "#fff",
        cursor: "pointer"
      }}
    >Join</button>
  </div>
  );
}
