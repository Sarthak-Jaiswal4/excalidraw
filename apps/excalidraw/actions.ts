'use server'

import axios from "axios";
import { cookies } from "next/headers";

export const login = async (data: any) => {
    const response = await axios.post('http://backend:3001/login', data);
    if (response.status === 200 && response.data.token) {
        (await cookies()).set("token", response.data.token);
        return { success: true };
    } else {
        return { success: false};
    }
}

export const signup = async (data: any) => {
    const response = await axios.post('http://backend:3001/signup', data);
    if (response.status === 200 && response.data.token) {
        (await cookies()).set("token", response.data.token);
        return { success: true };
    } else {
        return { success: false};
    }
}

export const getRooms=async()=>{
    const getcookie = (await cookies()).get("token");
    const getroom = await axios.get('http://backend:3001/getallroom', {
        headers: {
            Authorization: `${getcookie?.value}`
        }
    });

    let allrooms:any[]=[]
    if(getroom.data.rooms){
        allrooms = [...getroom.data.rooms.rooms,...getroom.data.rooms.memberRooms];
    }

    if (getroom.status === 200) {
        return { status: true, rooms: allrooms, userId: getroom.data.userId };
    } else {
        return { status: false, rooms: [] };
    }
}

export const createRoom=async(name:string)=>{
    const getcookie=(await cookies()).get("token")
    const createroom = await axios.post(
        'http://backend:3001/createroom',
        {name}, // send as string
        {
            headers: {
                Authorization: `${getcookie?.value}`,
            }
        }
    )
    if(createroom.status==200){
        return {status:true,room:createroom.data}
    }else{
        return {status:false,room:{}}
    }
}

export const updatemember=async(roomid:string)=>{
    const getcookie=(await cookies()).get("token")
    const updatemember = await axios.post(
        'http://backend:3001/update/members',
        {roomid}, 
        {
            headers: {
                Authorization: `${getcookie?.value}`,
            }
        }
    )
    console.log(updatemember.data)
    if(updatemember.status==200){
        return {status:true}
    }else{
        return {status:false}
    }
}

export async function GetMessages(roomid:string): Promise<any[]> {
    try {
        const getcookie=(await cookies()).get("token")
        const response = await axios.get(`http://backend:3001/chat/${roomid}`, {
            headers: {
                Authorization: `${getcookie?.value}`
            }
        });
        const shapes = response.data.message.map((m: any) => {
            return JSON.parse(m.message)
        })
        return shapes
    } catch (e: any) {
        console.log("Network Error", e);
        return [];
    }
}

export async function updatesnap(snapURL:string,roomid:number) {
    try {
        console.log(snapURL,roomid)
        const getcookie=(await cookies()).get("token")
        const response = await axios.post(`http://backend:3001/update/snapshot`,{snapURL,roomid},{
            headers: {
                Authorization: `${getcookie?.value}`
            }
        });

        console.log(response.data)
        if(response.status==200){
            return {status:true}
        }else{
            return {status:false}
        }
    } catch (e: any) {
        console.log("Network Error", e);
        return [];
    }
}