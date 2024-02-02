import React,{useState,useEffect,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {io} from 'socket.io-client'
import chatBG from './chatBG.png'
import ScrollToBottom from 'react-scroll-to-bottom';
const UserInterface = () => {
  const navigate = useNavigate()
  const [search,setSearch] = useState('')
  const [chats,setChats] = useState([])
  const [otherChatter,setOtherChatter] = useState()
  const [chatInfo,setChatInfo] = useState('')
  const [isChatting,setIsChatting] = useState(false)
  const [currentMessage,setCurrentMessage] = useState('')
  const [chatData,setChatData] = useState([])
  const [currentUser,setCurrentUser] = useState('')
  const [currentUsername,setCurrentUsername] = useState('')
  const [realTimeMessages,setRealTimeMessages] = useState([])

  const [isTyping,setIsTyping] = useState({})
  const socket = io('http://localhost:3000')
  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){
      return navigate('/')
    }
   axios.get('http://localhost:3000/api/currentuser',{
    headers:{
      'x-access-token':localStorage.getItem('token')
    }
   }).then(data=>{
    console.log(data)
    setCurrentUsername(data.data.user.userName)
    socket.emit('create-room',data.data.id)
   })
    
   return ()=>{
    socket.disconnect()
   }
  },[])

  useEffect(()=>{
    if(currentUser!=chatInfo){
       socket.on('receive-message',(data)=>{
        setRealTimeMessages((list)=>[...list,data])
        console.log(realTimeMessages)
       })}
       else{
        socket.on('receive-message',(data)=>{
          setRealTimeMessages((list)=>[...list,data])
          console.log(realTimeMessages.length)
         })
       }
       socket.on('Istyping',(data)=>{
        console.log(data)
        setIsTyping(data)
       })
       socket.on('IsnotTyping',(data)=>{
        console.log(data)
        setIsTyping(false)
       })
  },[socket])
  useEffect(()=>{
    setTimeout(()=>{
      axios.get('http://localhost:3000/api/user/allusers?search='+search,{
      headers:{
        'x-access-token':localStorage.getItem('token')
      }
    }).then((res)=>{
      setChats(res.data.user)
    }).catch(err=>console.log(err))
    },500)
  },[search])

  function messagingOther(chatId,username){
    setOtherChatter(username)
    setChatInfo(chatId)

    console.log(chatId)
    axios.get(`http://localhost:3000/api/user/message/${chatId}`,{
      headers:{
        'x-access-token':localStorage.getItem('token')
      }
    }).then((res)=>{
      console.log(res.data)
      setChatData(res.data)
      setCurrentUser(res.data.sender)
      setIsChatting(true)
      socket.emit('Start-chat',chatId)
  
      console.log("Reached")
      
    }).catch((err)=>{console.log(err)})
  }
  function sendMessage(e){
    e.preventDefault()
    setIsTyping(false)
    document.querySelector('#messaging-box').value=''
    const realTimeMessage ={
      message:currentMessage,
      sender:currentUser,
      receiver:chatInfo,
      room:chatInfo
    }
    socket.emit('send-message',realTimeMessage)
      
    socket.emit('stopped-typing',chatInfo)
    axios.post('http://localhost:3000/api/user/sendmessage',{chatInfo,currentMessage},{
      headers:{
        'x-access-token':localStorage.getItem('token')
      }
    }).then((res)=>{

      // console.log(res.data)

    }).catch((err)=>{console.log(err)})
   

  }
  return (
    <div className='h-screen w-screen bg-[#00A884] flex justify-center items-center'>
      <div className='w-5/6 h-5/6 bg-[#F0F2F5] flex justify-center items-center rounded-md p-1' id='Hero'>
      
          <div className='h-full w-1/3 bg-[#F0F2F5]'>
            <div className='h-16 w-full bg-[#F0F2F5] flex justify-between items-center'>
            <div className="avatar placeholder">
  <div className="bg-neutral w-12 text-neutral-content rounded-full hover:w-16 cursor-pointer  ease-in-out duration-300 ">
    <span className="text-xl">{currentUsername.slice(0,1)}</span>
  </div>
</div> 
              <div>{currentUsername}</div>
            <button type="logout" 
            onClick={()=>{
              localStorage.removeItem('token')
              navigate('/')
          }}
            className='h-9 w-24 bg-red-500 p-1 ml-5 rounded-xl'>Logout</button>
            </div>
            <div className='h-16 w-full bg-white flex justify-center items-center' id='search'>
               <input type="text" placeholder='Search' 
               onChange={(e)=>{
                
                setSearch(e.target.value)
              }}
               className='h-10 w-4/5 bg-slate-200 rounded-md outline-none border-none pl-2'/>
            </div>
            <div className="flex flex-col overflow-y-scroll w-full" id="heightclass">

                 {chats.map((user,i)=>{
                 
                 return user.username!=currentUsername&&<div key={i}><div 
                 onClick={()=>{

                    messagingOther(user._id,user.username)
                 }}
                 className="bg-white h-20  m-0 cursor-pointer flex items-center gap-20" key={i}>

<div className="avatar placeholder">
  <div className="bg-neutral w-14 hover:w-16 text-neutral-content rounded-full ease-in-out duration-300">
    <span className="text-xl">{user.username.slice(0,1)}</span>
  </div>
</div> 

                  <div>{user.username}</div>
                  
                  </div><hr/></div>
                 })
                 }
               
            

</div>
            

          </div>
          <div className='h-full w-3/4 bg-slate-100 flex flex-col'   style={{backgroundImage:`url(${chatBG})`}} >

          {isChatting&&<><div className='h-16 w-full bg-[#F0F2F5] flex justify-center items-center'>
            {otherChatter}
          </div>
          <ScrollToBottom 
          
          className='h-4/5 w-full overflow-y-auto'>
            {isChatting&&chatData.messages.map((chat,i)=>{
              const messageTime = new Date(chat.time)
              const Hours = messageTime.getUTCHours()
              const Minutes = messageTime.getUTCMinutes()
              const Seconds = messageTime.getUTCSeconds()
               if(chatData.receiver===chat.sender)
              return <div  key={i}>

<div className="chat chat-start ">
  <div className="chat-header">
    {otherChatter}
  </div>
  <div className="chat-bubble bg-white text-black">{chat.message}</div>
  <div className="chat-footer opacity-50">
   {

      `${Hours}:${Minutes}`

   }
  </div>
</div>
                      
                    </div>
          
              
              else return <div  key={i}>
               
               <div className="chat chat-end">
                 <div className="chat-bubble bg-green-200 text-black">{chat.message}</div>
                 <div className="chat-footer opacity-50">
                     {`${Hours}:${Minutes}`}</div>
                  </div>
                    </div>
            })}
           
            { 
              realTimeMessages.map((message,i)=>{
               
               
                 if(message.sender===currentUser&&message.receiver===currentUser) 
                 if(realTimeMessages.length+1!=i)
                 return <div  key={i}>
               
                 <div className="chat chat-end">
                   <div className="chat-bubble bg-green-200 text-black">{message.message}</div>
                    </div>
  
                           </div>
                 else if(message.sender===currentUser){
                  return <div  key={i}>
               
                  <div className="chat chat-end">
                    <div className="chat-bubble bg-green-200 text-black">{message.message}</div>
                     </div>
   
                            </div>
                }
                else {
                  return <div key={i}>
                 
                  <div >
               
                  <div className="chat chat-start">
                    <div className="chat-bubble bg-white text-black">{message.message}</div>
                     </div>
   
                            </div></div>
                }
              })
            }
             {
              isTyping.typing&&(isTyping.user===currentUser)&&<div>
               
              <div className="chat chat-start">
                <div className="chat-bubble bg-white text-black">

                <span className="loading loading-dots loading-lg"></span>

                </div>
                 </div>

                        </div>
            }
               
      


          </ScrollToBottom>
          <form method='post' 
          onSubmit={sendMessage}
          className='h-16 w-full flex justify-center items-center' >
            <input type="text" id='messaging-box'
            onChange={(e)=>{
              setCurrentMessage(e.target.value)
               socket.emit('typing',{chatInfo})
            }}
            placeholder='Type a message' className='h-10 w-4/5 bg-white rounded-md outline-none border-none pl-2'/>
             <button type="submit" className='h-9 w-24 bg-[#47C355] p-1 ml-5 rounded-xl'>Send</button>
          </form>
</>}

          </div>


     </div>
    </div>
  )
}

export default UserInterface
