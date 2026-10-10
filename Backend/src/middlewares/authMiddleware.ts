import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { serverConfig } from "../config";

export interface AuthenticatedRequest extends Request{
    user?:{id:string,role:string,wardId?:string};
}

export function authenticateToken(req:AuthenticatedRequest,res:Response,next:NextFunction){
    const token=req.cookies.token?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            message:'Access Denied: No Token Provided'
        });
    }

    try{
        const verified=jwt.verify(token,serverConfig.JWT_SECRET) as any;
        req.user=verified;
        next();
    }catch(err){
        res.status(403).json({
            message:'Invalid Token'
        })
    }
};

export function requireRole(...roles:string[]){
    return (req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({
                message:'Forbidden: Insufficient permissions'
            })
        }
        next();
    }
}