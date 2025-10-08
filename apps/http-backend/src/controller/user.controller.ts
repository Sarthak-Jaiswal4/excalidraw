import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_secret } from '@repo/common_DB/config'
import { CreateSchema,SigninSchema } from '@repo/common/types'
import { prismaClient } from '@repo/DB/DB'

export const signup = async (req: Request, res: Response) => {
    try {
        const parsedData = CreateSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.json({
                message: "Incorrect inputs"
            })
            throw new Error("missing credentials")
        }
        try {
            const user=await prismaClient.user.create({
                data:{
                    email: parsedData.data?.email,
                    password: parsedData.data?.password,
                    name: parsedData.data?.name
                }
            })
            const token=jwt.sign({
                userId:user.id
            }, JWT_secret)
            res.json({
                token
            })
        } catch (error) {
            console.log(error)
            res.status(411).json({
                message:"user already exists"
            })
        }
    } catch (error: any) {
        console.log("error in signup", error)
        throw new Error(error)
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const data = SigninSchema.safeParse(req.body)

        if (!data.success) {
            return res.json({ message: "missing credentials", status: 200 })
        }

        try {
            const user=await prismaClient.user.findFirst({
                where:{
                    email:data.data.email,
                    password:data.data.password
                }
            })
            if(!user){
                res.status(401).json({
                    message:"wrong email or password"
                })
                return
            }
            const token=jwt.sign({
                userId:user.id
            }, JWT_secret)

            res.json({
                token
            })
        } catch (error) {
            console.log(error)
        }

    } catch (error: any) {
        console.log("error in login", error)
        throw new Error(error)
    }
}