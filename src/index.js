// Load environment variables
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDb from './db/db1.js';
import app from './app.js';
import { createServer } from 'http'
import {Server} from 'socket.io'

// console.log(process.env, "index");

/**
 * Do not modify any code in this file
 */

connectDb()
    .then(() => {
        const server = createServer(app)
        const io = new Server(server, {
            cors: {
                origin: [
                    "https://nexadev-consultancy-service.vercel.app",
                    "http://localhost:5173",
                ],
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });

        io.on('connection', (socket) => {
            console.log(`user connected: ${socket.id}`.bgCyan)

            socket.on('setup', (userData) => {
                console.log(`${userData._id}`.cyan)
                socket.join(userData._id)
                socket.emit('connected')
            })

            socket.on("join chat", (room) => {
                socket.join(room)
                console.log(`'user joined room ' ${room}`.green)
            })

            socket.on('new message', (newMessage) => {
                const chat = newMessage.chat;

                if (!chat.userId) console.log("chat.userid is not defined")
                if (!chat.mentorId) console.log("chat.mentorId is not defined")
                
                if (newMessage.sender._id === chat.mentorId.userId._id) {
                    socket.in(chat.userId._id).emit("message received",newMessage)
                }
                else if (newMessage.sender._id === chat.userId._id) {
                    socket.in(chat.mentorId.userId._id).emit("message received",newMessage)
                }

            })

            socket.on('disconnect', () => {
                console.log('user disconnected'.red)
            })
        })


        server.listen(process.env.PORT || 8000, () => {
            console.log(`listening on ${process.env.PORT}`)
        })

        app.on('error', (err) => {
            console.log("Error: ",err.message);
            throw err;
        });
    })
    .catch((err) => {
        console.log("catch Error : ",err.message);
    });
