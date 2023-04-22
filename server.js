/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
const mongoose= require ("mongoose");
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
process.on("uncaughtException",(err)=>{
  console.log(err.name,err.message);
  console.log(" UNCAUGH EXCEPTION SHUTTING DOWN.........")
 process.exit(1)
 });


const app = require('./app');

// here we connect mongoose to the application
const db= process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD)

mongoose.connect(db,{
  useUnifiedTopology: true ,
  useNewUrlParser:true,
  useCreateIndex: true,
  useFindAndModify:false
}).then(()=>{ 
  console.log("db connection");
});

// eslint-disable-next-line no-unused-vars
// here we make schema


const port = process.env.PORT || 3000;
const server=app.listen(port, () => {
  console.log(`App running on port${port}....`);
});

process.on("unhandeldrejection",(err)=>{
  console.log(err.name,err.message);
  console.log(" UNHANDLE REJECTION SHUTTING DOWN.........")
 server.close( ()=>{
  process.exit(1)
 })
 
})
// console.log(npmx)
