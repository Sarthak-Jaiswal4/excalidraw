'use server'

import axios from "axios";
import { cookies } from "next/headers";

const url=  process.env.PROD_HOST

const instance = axios.create({
    baseURL: url ? "http://localhost:3001/" : "http://backend:3001/"
});
console.log(instance.getUri())
export const login = async (data: any) => {
    try {
        const response = await instance.post('/login', data);
        if (response.status === 200 && response.data.token) {
            (await cookies()).set("token", response.data.token);
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        return { success: false };
    }
}

export const logout = async () => {
    try {
        const token=(await cookies()).delete("token")
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export const signup = async (data: any) => {
    const response = await instance.post('/signup', data);
    if (response.status === 200 && response.data.token) {
        (await cookies()).set("token", response.data.token);
        return { success: true };
    } else {
        return { success: false};
    }
}

export const getRooms = async () => {
    const getcookie = (await cookies()).get("token");
    const getroom = await instance.get('/getallroom', {
        headers: {
            Authorization: `${getcookie?.value}`
        }
    });

    const mycreatedroom = [...getroom.data.rooms.rooms];
    const memberRooms = getroom.data.rooms.memberRooms;
    const myallrooms = getroom.data.allrooms;
    const favrooms = getroom?.data?.rooms.favorite;
    if (getroom.status === 200) {
        return { status: true, mycreatedrooms: mycreatedroom, memberroom: memberRooms, myallrooms: myallrooms, userId: getroom.data.userId, favrooms };
    } else {
        return { status: false, rooms: [] };
    }
}

export const createRoom = async (name: string) => {
    const getcookie = (await cookies()).get("token");
    const createroom = await instance.post(
        '/createroom',
        { name },
        {
            headers: {
                Authorization: `${getcookie?.value}`,
            }
        }
    );
    if (createroom.status == 200) {
        return { status: true, room: createroom.data };
    } else {
        return { status: false, room: {} };
    }
}

export const updatemember = async (roomid: string) => {
    const getcookie = (await cookies()).get("token");
    const updatemember = await instance.post(
        '/update/members',
        { roomid },
        {
            headers: {
                Authorization: `${getcookie?.value}`,
            }
        }
    );
    console.log(updatemember.data);
    if (updatemember.status == 200) {
        return { status: true };
    } else {
        return { status: false };
    }
}

export async function GetMessages(roomid: string): Promise<any[]> {
    try {
        const getcookie = (await cookies()).get("token");
        const response = await instance.get(`/chat/${roomid}`, {
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

export async function updatesnap(snapURL: string, roomid: number) {
    try {
        const getcookie = (await cookies()).get("token");
        const response = await instance.post('/update/snapshot', { snapURL, roomid }, {
            headers: {
                Authorization: `${getcookie?.value}`
            }
        });

        console.log(response.data)
        if (response.status == 200) {
            return { status: true }
        } else {
            return { status: false }
        }
    } catch (e: any) {
        console.log("Network Error", e);
        return [];
    }
}

export async function updatefavorite(userID: string, roomid: number, action: boolean) {
    try {
        const getcookie = (await cookies()).get("token");
        const response = await instance.post('/update/favorite', { userID, roomid, action }, {
            headers: {
                Authorization: `${getcookie?.value}`
            }
        });

        if (response.status == 200) {
            return { status: true }
        } else {
            return { status: false }
        }
    } catch (e: any) {
        console.log("Network Error", e);
        return [];
    }
}

export async function DeleteRoom(roomid: number){
    try {
        const token=(await cookies()).get("token")
        const DeleteRoom=await instance.post("/delete/room",{roomid},{
            headers:{
                Authorization: `${token?.value}`
            }
        })
        if(DeleteRoom.status===200){
            return {status:true}
        }else {
            return {status:false}
        }
    } catch (error) {
        console.log("Error in connecting to backend",error)
        return {status: false}
    }
}