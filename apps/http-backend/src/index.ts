import express, { Request, Response } from 'express'
import { login, signup } from './controller/user.controller'
import { middleware } from './middleware'
import { CreateRoomSchema } from '@repo/common/types'
import { prismaClient } from '@repo/DB/DB'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

app.post('/signup', signup)
app.post('/login', login)

app.post('/createroom', middleware, async (req: express.Request, res: express.Response) => {
    console.log(req.body)
    const data = CreateRoomSchema.safeParse(req.body)
    if (!data.success) {
        res.status(400).json({
            message: "incorrect inputs"
        })
        return
    }
    // userId is attached by middleware
    const userId = req.userId
    if (!userId) {
        res.status(401).json({ message: 'unauthorized' })
        return
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: data.data?.name,
                adminId: String(userId),
                members: {
                    connect: [{ id: String(userId) }]
                },
            }
        })
        res.status(200).json(room)
    } catch (error) {
        res.status(411).json({
            message: "room already exists!"
        })
    }
})

app.get('/room/:slug', async (req, res) => {
    const slug = req.params.slug
    try {
        const room = await prismaClient.room.findFirst({
            where: {
                slug
            },
            orderBy: {
                id: "desc"
            },
        })
        res.json({ room })
    } catch (error) {
        console.log("error in API", error)
    }
})

app.get('/chat/:roomid', async (req, res) => {
    const roomid = Number(req.params.roomid)
    console.log(roomid)
    try {
        const message = await prismaClient.chat.findMany({
            where: {
                roomId: roomid
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        })
        console.log(message.length)
        res.json({ message })
    } catch (error) {
        console.log("error in API", error)
    }
})

app.get('/getallroom', middleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        if (!userId) {
            res.status(401).json({ message: 'unauthorized' })
            return
        }
        const rooms = await prismaClient.user.findUnique({
            where: { id: String(userId) },
            include: {
                rooms: true,
                memberRooms: true,
                favorite:true,
            }
        })

        const allrooms = await prismaClient.room.findMany({
            where: {
                OR: [
                    { adminId: String(userId) },
                    {
                        members: {
                            some: {
                                id: String(userId)
                            }
                        }
                    }
                ]
            }
        })
        res.json({ rooms, userId, allrooms })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'internal error' })
    }
})

app.post('/update/members', middleware, async (req: Request, res: Response) => {
    try {
        const { roomid } = req.body
        console.log(roomid)
        const userid = req.userId
        if (!roomid) {
            res.status(400).json({ message: 'missing roomid' })
            return
        }
        if (!userid) {
            res.status(404).json({ message: 'unauthorized' })
            return
        }

        // Check if the user is already a member of the room
        const isalready = await prismaClient.room.findFirst({
            where: {
                id: Number(roomid),
                members: {
                    some: {
                        id: String(userid)
                    }
                }
            }
        });

        if(isalready){
            res.status(200).json({ message: "member already added" })
        }

        const updatemembers = await prismaClient.room.update({
            where: { id: Number(roomid) },
            data: {
                members: {
                    connect: {
                        id: String(userid)
                    }
                }
            }
        })

        res.status(200).json({ message: "Added member successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'internal error' })
    }
})

app.post('/update/snapshot', middleware, async (req: Request, res: Response) => {
    const { snapURL, roomid } = req.body
    console.log(snapURL, roomid)
    try {
        const updatesnap = await prismaClient.room.update({
            where: { id: roomid },
            data: {
                photo: snapURL
            }
        })

        res.status(200).json({ message: "snapshot successfully updated" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'internal error' })
    }
})

app.post("/update/favorite", middleware, async (req: Request, res: Response) => {
    try {
        const { userID, action, roomid } = req.body;
        console.log(userID,action,roomid)
        if (!userID || typeof action !== "boolean" || !roomid) {
            res.status(400).json({ message: "missing required fields" });
            return;
        }

        let updateData: any = {};
        if (action) {
            updateData = {
                favorite: {
                    connect: {
                        id: Number(roomid)
                    }
                }
            };
        } else {
            updateData = {
                favorite: {
                    disconnect: {
                        id: Number(roomid)
                    }
                }
            };
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: userID },
            data: updateData,
            include: { favorite:true }
        });

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong" });
    }
});

app.listen(3001, () => {
    console.log("Running on port 3001")
})