/* eslint-disable prettier/prettier */
/* eslint-disable lines-between-class-members */
/* eslint-disable prettier/prettier */

class APIfeatures{
    constructor(query,queryString){
      this.query=query;  // query as tour.find()
      this.queryString=queryString; /// queryString as req.query
    }
    filter()
    {
       //     1. filtering method////for duration and others
     const queryObj={ ...this.queryString };
     const excludesFields=["page","sort","limits","fields"];
      excludesFields.forEach(el=>delete queryObj[el]);
     
     
     // 1A. advance filtering//// with duration and greater and others
     let queryStr= JSON.stringify(queryObj)
     queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`);
    
      this.query=this.query.find(JSON.parse(queryStr))
     return this;
    }
    sort(){
    if(this.queryString.sort){
      const sortBy= this.queryString.sort.split(",").join(" ")
      
       this.query= this.query.sort(sortBy)
    }else {
      this.query= this.query.sort("-createdAt")
    }
    return this;
  }
  limitFIelds(){
    /////3. limiting
   if(this.queryString.fields){
    const fields= this.queryString.fields.split(",").join(" ");
    this.query= this.query.select(fields);
  }else{
   this.query=this.query.select("-_v")
  }
  return this;
  }
  pagination(){
  const page= this.queryString.page * 1 || 1;
  const limit= this.queryString. limit * 1 || 100;
  const skip= (page - 1) * limit;
  
  this.query= this.query.skip(skip).limit(limit);
  return this;
  }
  
  }
  module.exports=APIfeatures;