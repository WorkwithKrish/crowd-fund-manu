const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const routes = require('./routes/routes')
dotenv.config()
const port=process.env.PORT
const app=express()

 
app.use(express.json());


app.use('/',routes)

mongoose.connect(process.env.DB_URL)
.then(()=>{
    console.log("DB connected");
}).catch((error)=>{
    console.log(error);
    
})


app.listen(port,()=>{
    console.log(`server is running on ${port}`);
    
})
