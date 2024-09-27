import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

mongoose.connect("mongodb://localhost:27017/LoginSignUp")
.then(()=>{
    console.log("Mongodb Connected");
})
.catch((err)=>{
    console.log(`Failed to connect with MongoDb : ${err}`);
})
 const loginSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
 });


 const collection = new mongoose.model('loginCollection', loginSchema);

 export default collection;