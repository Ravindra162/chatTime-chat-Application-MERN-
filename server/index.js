const express = require('express')
require('dotenv').config()
const {createServer} = require('http')
const {Server} = require ('socket.io')
const app = express()
const server = createServer(app)
const cors = require('cors')
const io = new Server(server,{
    cors:{
        origin:'*'
    }
})
const {chatUser,chatModel,messageModel} = require('./Schemas.js')
const jwt = require('jsonwebtoken')
app.use(cors())
app.use(express.json())
const authMiddleware = (req,res,next) =>{
    const authToken = req.headers['x-access-token']
    if(authToken){
        const token = jwt.verify(authToken,process.env.jwt_secret)
        req.user = token
        next()
    }
    else{
        res.status(404).send('User Missed his chance')
    }
}
app.post('/api/register', async (req, res) => {
   
    const {username, email, password} = req.body
    const ifExistingUser = await chatUser.findOne({Email: email})
    if(ifExistingUser) return res.json({message: 'User already exists'})
    await chatUser.create({
        userName: username,
        Email: email,
        password: password
    })
    res.json({
           message:'Registered Successfully'
               })
})
app.post('/api/login',async (req,res)=>{
    try{
    const {email,password}=req.body
    const user=await chatUser.findOne({Email:email})
    if(!user) return res.json({message:'User not found'})
    if(user.password!==password) return res.json({message:'Incorrect Password'})

    const token = jwt.sign({id:user._id},process.env.jwt_secret)

    res.json({
        message:'Logged in successfully',
        token:token})
    
}
catch(err){
    console.log(err)
}
})

app.get('/api/currentuser',authMiddleware,async (req,res)=>{
    const decode = req.user.id
    const user = await chatUser.findOne({_id:decode})
    res.json({
        user:user,
        id:decode
    })
})

app.get('/api/user/allusers',authMiddleware,async (req,res)=>{
    const search = req.query.search || ""
    console.log(search)
    const filtered = await chatUser.find({
        $or:[{
            userName:{
                "$regex":search,
                "$options": "i"
            }
        }]
    })
    res.json({
        user: filtered.map(user => ({
            username: user.userName,
            _id: user._id
        }))
    })
})

app.get('/api/user/message/:otherUser',authMiddleware,async (req,res)=>{
     const otherUser = req.params.otherUser
        const currentUser = req.user.id
        console.log(currentUser)
        console.log(otherUser)

      const chat = await chatModel.findOne({
        $or:[{
            sender:currentUser,
            receiver:otherUser
        },{
            sender:otherUser,
            receiver:currentUser
        }]})

        if(chat){
            console.log('Chat Exists Bro!!!')
            // res.json({
            //     receiver:otherUser,
            //     chat:chat.content
            // })

            const messages = await messageModel.find({

                _id:{$in:chat.content}
            })

            res.json({
                sender:currentUser,
                receiver:otherUser,
                messages:messages
            })
        }
        else{

            console.log('Chat created');
            await chatModel.create({
                chatName:'normal',
                recentMessage:'',
                sender:currentUser,
                receiver:otherUser,
                content:[]
            })
        }
})

app.post('/api/user/sendmessage',authMiddleware,async (req,res)=>{
   
    const receiver = req.body.chatInfo
    const message = req.body.currentMessage
    const sender = req.user.id
    const messageModule = await messageModel.create({
              
        sender:sender,
        receiver:receiver,
        message:message,
        time:new Date()
    })
    const chatModule = await chatModel.findOne({
        $or:[{sender:sender,
            receiver:receiver},
             {receiver:sender,
              sender:receiver}]
        
    })

    chatModule.recentMessage = message
    chatModule.sender = sender
    chatModule.receiver = receiver
    chatModule.content.push(messageModule._id)
    await chatModule.save()
    console.log('Sent Successfully')

})

io.on('connection',(socket)=>{
    console.log('connected'+socket.id)
    socket.on('disconnect',()=>{
        console.log('disconnected'+socket.id)
    })
    socket.on('create-room',(room)=>{
        socket.join(room)
        console.log(socket.id+' Joined Room no - '+room)
    })
    socket.on('Start-chat',(otherChatter)=>{
       socket.join(otherChatter)
       console.log(socket.id+' Joined Room '+ otherChatter)
    })
    socket.on('send-message',(data)=>{
        socket.to(data.room).emit('receive-message',{
            message:data.message,
            sender:data.sender,
            receiver:data.receiver
        })
    })
    socket.on('typing',({chatInfo})=>{
        socket.to(chatInfo).emit("Istyping",{
            typing:true,
            user:chatInfo
        })
    })
    socket.on('stopped-typing',(room)=>{
        socket.to(room).emit('IsnotTyping', false);
    })
})
server.listen(3000, () => {console.log('server running at 3000')})