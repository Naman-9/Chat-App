const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Global variables to hold all usernames and rooms created
const usernames = {};
const rooms = [
    { name: "globalChat", creator: "Anonymous" },
    { name: "chess", creator: "Anonymous" },
    { name: "javascript", creator: "Anonymous" }
];

// need to write everything inside below function(backend only)
io.on("connection", function (socket) {
    socket.on("createUser", function (username) {
        socket.username = username;
        usernames[username] = username;
        socket.currentRoom = "globalChat";
        console.log(usernames); 

        socket.join("globalChat");         // for specific room, msg -- to join room
        socket.emit("updateChat", "INFO", "You have joined the globalChat.")

        socket.broadcast
            .to("globalChat")
            .emit("updateChat", "INFO", username + " has joined global room");
        io.sockets.emit("updateUsers", usernames);
        socket.emit("updateRooms", rooms, "globalChat");
    });

    socket.on("sendMessage", function (data) {
        // send msg to all members of a particuar room
        io.sockets.to(socket.currentRoom).emit("updateChat", socket.username, data)
    })

    // create new roomupdateRooms
    socket.on("createRoom", function(room) {
        if(room !== null) {
            rooms.push({name: room, creator: socket.username});
            io.sockets.emit("updateRooms", rooms, room);
        }
    })

    socket.on("updateRooms", function (room) {
        socket.broadcast
            .to(socket.currentRoom)
            .emit("updateChat", "INFO", socket.username + " left the room");

        socket.leave(socket.currentRoom);
        socket.currentRoom = room;
        socket.join(room);
        socket.emit("updateChat", "INFO", "You have joined " + room);
        socket.broadcast
            .to(socket.currentRoom)
            .emit("updateChat", "INFO", socket.username + " has joined" + room);

    })
})

server.listen(4000, function () {
    console.log(`Server is running at port 4000.`)
})