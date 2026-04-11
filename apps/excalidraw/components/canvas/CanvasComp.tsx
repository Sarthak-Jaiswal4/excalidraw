import React from 'react'
import SocketLayer from '../SocketLayer'
import { cookies } from 'next/headers'

async function CanvasComp({roomid}:{roomid:string}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return (
    <div className='w-full h-full'>
        <SocketLayer roomId={roomid} token={token} />
    </div>
  )
}

export default CanvasComp