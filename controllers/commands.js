 
// //   //                 WE BUILD A QUERY
//   //     1. filtering method////for duration and others

//    const queryObj={ ...req.query };
// const excludesFields=["page","sort","limits","fields"];
//  excludesFields.forEach(el=>delete queryObj[el]);


// // 1A. advance filtering//// with duration and greater and others
// let queryStr= JSON.stringify(queryObj)
// queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`);


//  // { duration:{$gte:5},difficulty:"easy"}
//  //{ duration: { gte: '5' }, difficulty: 'easy' }
//  // gte,gt,lt,lte
//  let query=  Tour.find(JSON.parse(queryStr))

//   //////2.Sort the query
//   if(req.query.sort){
//     const sortBy= req.query.sort.split(",").join(" ")
    
//      query= query.sort(sortBy)
//   }else {
//     query= query.sort("-createdAt")
//   }
//  /////3. limiting
//  if(req.query.fields){
//    const fields= req.query.fields.split(",").join(" ");
//    query= query.select(fields);
//  }else{
//   query=query.select("-_v")
//  }
//  /////4. pagination 

//  const page= req.query.page * 1 || 1;
//  const limit= req.query. limit * 1 || 100;
//  const skip= (page - 1) * limit;

// query= query.skip(skip).limit(limit);

// if (req.query.page) {

//   const numTours = await Tour.countDocuments(query);
  
//   if (numTours === 0) throw new Error('This page does not exist');
  
//   }

// ////5.HERE WE EXECUTE A QUERY
// query.sort().select().skip().limit()
