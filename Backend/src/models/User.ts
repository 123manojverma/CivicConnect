import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'Citizen' | 'Government' | 'NGO';
    wardId?: string;
    organizationName?: string;
    phone?: string;
    avatar?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    categories?: string[];
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
    },
    phone:{
        type:String
    },
    avatar:{
        type:String
    },
    location:{
        type:{
            type:String,
            enum:['Point']
        },
        coordinates:{
            type:[Number]
        }
    },
    categories:{
        type:[String],
        default:[]
    }
});

UserSchema.index({ location: '2dsphere' });

export const User=model<IUser>('User',UserSchema);