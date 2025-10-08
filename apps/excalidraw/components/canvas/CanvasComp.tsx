import React from 'react'
import SocketLayer from '../SocketLayer'

function CanvasComp({roomid}:{roomid:string}) {
  return (
    <div className='w-full h-full'>
        <SocketLayer roomId={roomid} />
    </div>
  )
}

export default CanvasComp