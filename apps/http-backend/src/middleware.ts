import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_secret } from '@repo/common_DB/config'

export const middleware=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.headers['authorization'] ?? ""

        const decoded=jwt.verify(token,JWT_secret)

        if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
            // Attach userId to req as a custom property
            (req as any).userId = String((decoded as any).userId);
            next();
        }
        else{
            res.status(403).json({message:"unauthorized"})
        }
    } catch (error) {
        console.log(error)
    }
}