import * as z from "zod";

export const CreateSchema=z.object({
    email:z.string(),
    password:z.string(),
    name:z.string()
})

export const SigninSchema=z.object({
    email:z.string(),
    password:z.string(),
})
export const CreateRoomSchema=z.object({
    name:z.string()
})