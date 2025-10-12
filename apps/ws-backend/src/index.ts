import { WebSocket, WebSocketServer } from 'ws'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_secret } from './config';
import { prismaClient } from '@repo/DB/DB';
import { createClient } from 'redis';

const pub = createClient({
    username: 'default',
    password: 'mpZbNvRxYHTOKNUZ1iGPRBVF6Bpav0Qw',
    socket: {
        host: 'redis-16343.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16343
    }
});

const sub = createClient({
  username: 'default',
  password: 'mpZbNvRxYHTOKNUZ1iGPRBVF6Bpav0Qw',
  socket: {
      host: 'redis-16343.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
      port: 16343
  }
});

  const wss = new WebSocketServer({ port: 8080 });

interface usertype {
  userId: string,
  rooms: number[],
  websocket: WebSocket
}

const users: usertype[] = []

const subscribedchannel=new Set()

function checkuser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_secret);

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return null;
    }
    return (decoded as JwtPayload).userId as string;
  } catch (error) {
    console.log(error);
    return null;
  }
}

pub.on('error', err => console.log('Redis Publisher Error', err));
sub.on('error', err => console.log('Redis Subscriber Error', err));

// Connect to Redis
pub.connect();
sub.connect();

wss.on('connection',async function connection(ws, request) {
  ws.on('error', console.error);

  const url = request.url
  if (!url) {
    return;
  }
  const queryparams = new URLSearchParams(url.split('?')[1])
  const token = queryparams.get('token') || ""
  const userId = checkuser(token)

  if (!userId && userId!=undefined && userId!=null) {
    ws.close()
    return
  }

  users.push({
    userId: userId as string,
    rooms: [],
    websocket: ws
  })

  ws.on('message',async function message(data: any) {
    const parsedData = JSON.parse(data)
    console.log(parsedData)

    if(parsedData.type === "corsor_move"){
      const posx=parsedData.posx;
      const posy=parsedData.posy;
      const finduser=users.find(user => user.websocket===ws)
      if(finduser){
        users.forEach((user)=>{
          if(user.rooms.includes(parsedData.roomId)){
            user.websocket.send(JSON.stringify({
              posx,posy,type:"corsor_move"
            }))
          }
        })
      }
    }

    if (parsedData.type === "join_room") {
      const existuser = users.find(user => user.websocket === ws)
      if (!existuser) {
        users.push({
          userId: userId as string,
          rooms: [parsedData.room],
          websocket: ws
        })
      } else {
        const upadteduser = existuser.rooms.push(parsedData.room)
      }
      if(!subscribedchannel.has(parsedData.romm)){
        subscribedchannel.add(parsedData.room)
        try {
          await sub.subscribe(`${parsedData.room}`, (message,channel) => {
            console.log(`Subscribed successfully to room: ${channel},${message}`);
            
            users.forEach(user => {
              if (user.rooms.includes(Number(channel)) && ws!==user.websocket) {
                user.websocket.send(JSON.stringify(message))
              }
            })
          });
        } catch (err) {
          console.error('Failed to subscribe:', err);
        }
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(user => user.websocket === ws)
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter(r => r === parsedData.room)
    }

    if (parsedData.type === "chat") {
      const room = parsedData.room
      const message = parsedData.message
      
      // const chat=await prismaClient.chat.create({
      //   data:{
      //     roomId:room,
      //     message:message,
      //     userId: userId as string
      //   }
      // })

      try {
        await pub.publish(`${parsedData.room}`,JSON.stringify({
          type:"chat",
          message,
          roomId:Number(room),
          userId
        }));
      } catch (err) {
        console.error('Failed to publish message:', err);
      }
    }

    if(parsedData.type === 'delete'){
      const room = parsedData.room
      const message = parsedData.message

      users.forEach(user => {
        if (user.rooms.includes(room)) {
          user.websocket.send(JSON.stringify({
            type:"delete",
            message,
            roomId:room,
          }))
        }
      })
    }

    if(parsedData.type==='move'){
      const room = parsedData.room
      const message = parsedData.message

      users.forEach(user => {
        if (user.rooms.includes(room)) {
          user.websocket.send(JSON.stringify({
            type:"move",
            message,
            roomId:room,
          }))
        }
      })
    }
  });
})