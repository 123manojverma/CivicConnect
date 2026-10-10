export enum tags{
   Government="Government",
   NGO="NGO"
}

export interface taggedEntityinterface{
    type:tags
    id:string
}

export interface IssueDTO{
    title:string,
    description:string,
    category:string,
    longitude:number
    latitude:number,
    wardId:string,
    userId:string,
    taggedEntity?:taggedEntityinterface
}

export interface INearbyDuplicate {
    category: string,
    longitude: number, 
    latitude: number, 
    maxDistance: number
}


export interface IFindByWard{
    wardId:string,
    status?:StatusEnum
}

export interface IUpdateStatus{
    id:string,
    status:StatusEnum
}


export enum StatusEnum{
    SUBMITTED='Submitted',
    IN_PROGRESS='In Progress',
    RESOLVED='Resolved'
}