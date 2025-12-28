import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()

app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
})


io.on('connection', (socket)=>{
    console.log('Client connected', socket.id)
    
    // socket.on('join_room', (data)=>{
    //     socket.join(data)
    // })

    socket.on('send_message', (data)=>{
        //For self message
        socket.broadcast.emit('recv_msg', {
            message : data.message
        })
        
    })
})

server.listen(3003, () =>{
    console.log('Listening on the PORT 3003')
})