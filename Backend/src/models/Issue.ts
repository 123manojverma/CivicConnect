import { Schema, model, Document } from "mongoose";

export interface IIssue extends Document{
    title:string;
    description:string;
    category:string;
    status: 'Submitted' | 'In Progress' | 'Resolved';
    location:{
        type:'Point';
        coordinates:[number, number];
    };
    wardId:string;
    taggedEntity?:{type: 'Government' | 'NGO'; id:string};
    upvotes:number;
    upvotedBy:string[];
    createdAt:Date;

}

const IssueSchema = new Schema<IIssue>({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String, 
        required:true
    },
    category:{
        type:String, 
        required:true},
    status:{
        type:String, 
        enum:['Submitted' , 'In Progress' , 'Resolved'], 
        default: 'Submitted'
    },
    location:{
        type:{
            type:String, 
            enum:['Point'], 
            required:true, 
            default:'Point'
        },
        coordinates:{
            type:[Number], 
            required:true
        }
    },
    wardId:{
        type:String,
        required:true
    },
    taggedEntity:{
        type:{
            type:String, 
            enum:['Government', 'NGO']
        },
        id:{
            type:String
        }
    },
    upvotes:{
        type:Number, 
        default:1
    },
    upvotedBy:{
        type:[String], 
        default:[]
    },
    createdAt:{
        type:Date, 
        default:Date.now
    }
});

IssueSchema.index({location:'2dsphere'});

export const Issue = model<IIssue>('Issue', IssueSchema);
