import z from "zod";
import { tags } from "../dto/Issuedto";

export const CreateUserSchema=z.object({
    title:z.string().min(1),
    description:z.string().min(1),
    category:z.string().min(1),
    longitude:z.number(),
    latitude:z.number(),
    wardId:z.string(),
    userId:z.string(),
    taggedEntity:z.object({
        type:z.nativeEnum(tags),
        id:z.string()
    }).optional()
})