const socket = io();

socket.on("connect", () => {
    console.log("Connesso al server con id:", socket.id);
});