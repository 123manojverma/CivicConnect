import { IFindByWard, INearbyDuplicate, IUpdateStatus } from "../dto/Issuedto";
import { IIssue, Issue } from "../models/Issue";

export class IssueRepository {
    async findNearbyDuplicate(data:INearbyDuplicate) {
        const {category,longitude,latitude,maxDistance}=data;
        return await Issue.findOne({
            category,
            status:{$ne:'Resolved'},
            location:{
                $near:{
                    $geometry:{type:'Point',coordinates:[longitude,latitude]},
                    $maxDistance: maxDistance
                }
            }
        });
    }

    async create(issueData:Partial<IIssue>){
        const newIsssue=new Issue(issueData);
        return await newIsssue.save();
    }

    async findById(id:string){
        return await Issue.findById(id);
    }

    async save(issue:IIssue){
        return await issue.save();
    }

    async findByWard(data:IFindByWard){
        const {wardId,status}=data;
        const query:Record<string,any>={wardId};
        if(status) query.status=status;
        return await Issue.find(query).sort({upvotes:-1,createdAt:-1});
    }

    async findByNgo(ngoId:string){
        return await Issue.find({
            'taggedEntity.type':'NGO',
            'taggedEntity.id':ngoId
        }).sort({createdAt:-1});
    }

    async updateStatus(data:IUpdateStatus){
        const {id,status}=data;
        return await Issue.findByIdAndUpdate(
            id,
            {status},
            {new:true,runValidators:true}
        );
    }
}

export const issueRepository=new IssueRepository();