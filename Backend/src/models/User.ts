import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'Citezen' | 'Government' | 'NGO';
    wardId?: string;
    organizationName?: string;
}

const UserSchema=new Schema<IUser>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    }
    ,passwordHash:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['Citizen','Government','NGO'],
        required:true
    },
    wardId:{
        type:String
    },
    organizationName:{
        type:String
    }
});

export const User=model<IUser>('User',UserSchema);