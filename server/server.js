const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const porta = 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Un giocatore si è connesso", socket.id);

    socket.on("disconnect", () => {
        console.log("Un giocatore si è disconnesso", socket.id);
    });
});

server.listen(porta, () => {
    console.log(`Server in ascolto su http://localhost:${porta}`)
})