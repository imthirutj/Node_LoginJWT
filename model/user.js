const mongoose = require('mongoose');

const UserSchema= new mongoose.Schema({
    name:{type:String, required: true},
    username:{type:String, required: true, unique: true},
    password:{type:String, required: true},
    role:{type:String, required:true},
    age:{type:Number, required:true}
    },
    {
       collection:'users' 
    }
)

const model = mongoose.model('Userschema',UserSchema);


module.exports = model;