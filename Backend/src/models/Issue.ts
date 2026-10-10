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
    reportedBy:string;
    images:string[];
    completionImage?:string;
    completionVotes:{userId:string; approved:boolean}[];
    govMarkedComplete:boolean;
    govMarkedAt?:Date;
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
    reportedBy:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        default:[]
    },
    completionImage:{
        type:String
    },
    completionVotes:{
        type:[{userId:{type:String},approved:{type:Boolean}}],
        default:[]
    },
    govMarkedComplete:{
        type:Boolean,
        default:false
    },
    govMarkedAt:{
        type:Date
    },
    createdAt:{
        type:Date, 
        default:Date.now
    }
});

IssueSchema.index({location:'2dsphere'});

export const Issue = model<IIssue>('Issue', IssueSchema);
