enum  tags{
   Government="Government",
   NGO="NGO"
}

interface taggedEntityinterface{
    type:tags
    id:string
}

interface IssueDTO{
    title:string,
    description:string,
    category:string,
    longitude:number
    latitude:number,
    wardId:string,
    userId:string,
    taggedEntity?:taggedEntityinterface
}