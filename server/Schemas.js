const mongoose = require('mongoose')

// ZxXD9xc26aOyOvDY
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Connected to MongoDB...')).catch(err => console.log(err))



const userSchema = new mongoose.Schema({
    userName: String,
    Email: String,
    password: String
},{
    timestamps:true
})
const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    time: { type: Date, default: Date.now }
  }, {
    timestamps: true
  });
  
  const chatSchema = new mongoose.Schema({
    chatName: String,
    recentMessage: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
  }, {
    timestamps: true
  });



const chatUser = mongoose.model('user', userSchema)

const chatModel = mongoose.model('chat', chatSchema)

const messageModel = mongoose.model('message', messageSchema)

module.exports = {chatUser,chatModel,messageModel}