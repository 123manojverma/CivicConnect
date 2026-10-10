import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { serverConfig } from "../config";

export interface AuthenticatedRequest extends Request{
    user?:{id:string,role:string,wardId?:string};
}

export function authenticateToken(req:Request,res:Response,next:NextFunction):void{
    const authReq = req as AuthenticatedRequest;
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        token = (req as any).cookies?.token?.split(' ')[1] || null;
    }
    if(!token){
        res.status(401).json({
            message:'Access Denied: No Token Provided'
        });
        return;
    }

    try{
        const verified=jwt.verify(token,serverConfig.JWT_SECRET) as any;
        authReq.user=verified;
        next();
    }catch(err){
        res.status(403).json({
            message:'Invalid Token'
        });
    }
};

export function requireRole(...roles:string[]){
    return (req:Request,res:Response,next:NextFunction):void=>{
        const authReq = req as AuthenticatedRequest;
        if(!authReq.user || !roles.includes(authReq.user.role)){
            res.status(403).json({
                message:'Forbidden: Insufficient permissions'
            });
            return;
        }
        next();
    }
}