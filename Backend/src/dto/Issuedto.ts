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