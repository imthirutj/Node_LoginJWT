
const { Console } = require('console');
const express = require('express');
const bodyParser=require('body-parser');
const path = require('path');
const mongoose= require('mongoose');
const jwt = require('jsonwebtoken');
const User= require('./model/user');
const SECRET_KEY='TJ_SECRET';

mongoose.connect('mongodb+srv://Imthirutj:750271997@cluster0.2aqov0m.mongodb.net/LoginJWT',{
    useNewUrlParser:true,
    useUnifiedTopology:true
   
    
});
const bcrypt = require('bcryptjs');
const app= express();


app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());



//update-myuser

app.use('/api/update-myuser', async (req,res) => {
    const {token , username, name, role, age}= req.body;
    
    try{
        if(!token){
           return  res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        

       const userRole= user.role;
        console.log("THE USER: "+userRole);

 
             await User.updateOne({username},{
                $set:{username:username, name:name, role:role, age:age}
             })
             .then(result=>{
                res.json({status:'OK', result: 'Updated'});
             });
           
           
        
       // 
    }
    catch(error){
        return res.json({status:'error', error:error.message});
    }
});




//update-user
app.use('/api/user-update', async (req,res) => {
    const {token , username, name, role, age}= req.body;

    try{
        if(!token){
           return  res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        

       const userRole= user.role;
        console.log("THE USER: "+userRole);

        if(userRole == 'admin'){
             await User.updateOne({username},{
                $set:{username:username, name:name, role:role, age:age}
             })
             .then(result=>{
                res.json({status:'OK', result: 'Updated'});
             });
           
           
           
        }
        else{
             res.json({status:'error' ,error: ' You are Not Authorized to edit'});
        }
       // 
    }
    catch(error){
        return res.json({status:'error', error:error.message});
    }
});

//get-user-toupdate//myuser
app.use('/api/get-user-toupdate-myuser', async (req,res) => {
    const token = req.query.token;
   
    try{
        if(!token){
           return  res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        
        const username=user.username;

       const userRole= user.role;
        console.log("THE USER: "+userRole);
      
    
             await User.findOne({username:username}).then((result)=>{
                console.log("data: "+result);
                res.json({status:'OK', data:result});
            });
           
    
       // 
    }
    catch(error){
        return res.json({status:'error', error:error.message});
    }
});




//get-user-toupdate
app.use('/api/get-user-toupdate', async (req,res) => {
    const token = req.query.token;
    const username= req.query.username;
   
    try{
        if(!token){
           return  res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        
        

       const userRole= user.role;
        console.log("THE USER: "+userRole);
      
        if(userRole == 'admin'){
             await User.findOne({username:username}).then((result)=>{
                console.log("data: "+result);
                res.json({status:'OK', data:result});
            });
           
           
        }
        else{
             res.json({status:'error' ,error: ' You are Not Authorized to edit'});
        }
       // 
    }
    catch(error){
        return res.json({status:'error', error:error.message});
    }
});


//List Users
app.post('/api/list-users', async (req,res) => {
    const {token} = req.body;
    try{
        if(!token){
           return  res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        

       const userRole= user.role;
        console.log("THE USER: "+userRole);

        if(userRole == 'admin'){
            const listuser= await User.find({role:'user'}).lean();
            console.log(listuser);
            return res.json({status:'OK', data:listuser});
        }
        else{
             res.json({status:'error' ,error: ' Ypu are Not Authorized'});
        }
       // 
    }
    catch(error){
        return res.json({status:'error', error:error.message});
    }
});


//user-profile
app.get('/api/user-profile', async (req,res) => {
    const token = req.query.token;
    console.log('Token for user profile', token);

    try{
        if(!token){
            return res.json({status:'error', error:'Please log in'});
        }
        const user = jwt.verify(token.toString(), SECRET_KEY);
        

        const _id = user.id; 

        const theUser = await User.findById(_id);

        res.json({status:'OK', data: theUser})
       // console.log("THE USER: "+theUser);
    }
    catch(error){
        res.json({status:'error', error:error.message});
    }
})

//change password
app.post('/api/change-pwd', async (req,res)=>{
    const {token, newPassword: plainTextPassword} = req.body;
    
    //validation
    if(!plainTextPassword || typeof plainTextPassword !=='string'){
        return res.json({status:'Error', error:'Invalid password'});
    }

    if(plainTextPassword.length <5 || plainTextPassword.length>15){
        return res.json({status:'Error', error:"Password Length should be less than 15 and greater than 5"})
    }

    try{
    const user= jwt.verify(token.toString(), SECRET_KEY);

    const _id=user.id;
    console.log("token: "+token);
    const hashChangedPwd=await bcrypt.hash(plainTextPassword,10);
    await User.updateOne({_id},{
        $set:{password:hashChangedPwd}
    }).then((obj) => {
        console.log("updated: "+_id);
    });
    console.log('Changed Password is ',hashChangedPwd);
    res.json({status:'OK'});
    }
    catch(error){
        res.json({status:'error', error:error.message});
    }

})
//Login Service
app.post('/api/login', async(req,res)=>{
    const {username, password} = req.body;
   

    //validate user from db
    const user = await User.findOne({username}).lean();
    if(!user){
        return res.json({status:'error', error:'User not Found'});

    }
    if(await bcrypt.compare(password, user.password)){
        
        const token = jwt.sign({
            id: user._id, 
            username:user.username, 
            role:user.role
        },SECRET_KEY);

        return res.json({status:'OK', data:token});
    }
    
    res.json({status: 'error', error:'Invalid username and Passowrd'});
});

//Register service
app.post('/api/register', async(req,res)=>{
    console.log('Request from Register User:\n'+req.body.username);

    const {name,username, password: plainTextPassword, role , age} = req.body;

    //validation
    if(!name || typeof name !=='string'){
        return res.json({status:'Error', error:'Invalid name'});
    }

    if(!username || typeof username !=='string'){
        return res.json({status:'Error', error:'Invalid username'});
    }

    if(!age ){
        return res.json({status:'Error', error:'age Required'});
    }

    if(!plainTextPassword || typeof plainTextPassword !=='string'){
        return res.json({status:'Error', error:'Invalid password'});
    }

    if(plainTextPassword.length <5 || plainTextPassword.length>15){
        return res.json({status:'Error', error:"Password Length should be less than 15 and greater than 5"})
    }
    const password= await bcrypt.hash(plainTextPassword,10);

    //put data in db
    try{
        const response = await User.create({
            name,
            username,
            age,
            role,
            password 
        })
        console.log('user created successfully ', response);
    }
    catch(error){
        if(error.code===11000){
            return res.json({status: 'Error', error:'username is already exists'});

        }
        throw error
    }

    res.json({status:'OK'});
})

//logout
app.post('/api/log-out',async(req,res)=>{
    const { token } = req.body;

    try{
        jwt.destroy(token.toString());
        res.json({status:'OK', data:'Destroyed'});
    }
    catch(error){
        res.json({status:'error', error: error.message})
    }
})

app.listen(3000, ()=>{
    console.log("Server is running on 3000 port");
});