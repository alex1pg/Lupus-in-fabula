const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const ruoli = require("../info/ruoli.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const porta = 3000;

const stanze = {};
function generaCodiceStanza() {
    let codice;
    do {
        codice = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    } while (stanze[codice]);
    return codice;
}

const fases = {
    0: "Lobby",
    1: "Notte",
    2: "Girono",
}

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Un giocatore si è connesso", socket.id);

    socket.on("creaStanza", ({ nome }) => {
        console.log("creazione di una stanza " + nome);
        const codice = generaCodiceStanza();
        console.log("Stanza creata con codice:", codice);
        stanze[codice] = {
            giocatori: {
                [socket.id]: {nome, host: true}
            },
            fase: fases[0],
        }

        socket.join(codice);
        socket.join(ruoli);
        socket.data.stanza = codice; // servira per disconneterci
        socket.emit("stanzaCreata", {codice, ruoli});
        trasmettiLobby(codice);
    });

    socket.on("unisci", ({ codice, nome }) => {
        codice = codice.toUpperCase();
        const stanza = stanze[codice];

        if(!stanza){
            socket.emit("errore", "Stanza non trovata.");
            return;
        }

        if(stanza.fase !== fases[0]){
            socket.emit("errore","La partita è già iniziata.");
            return;
        }

        stanza.giocatori[socket.id] = {nome, host : false};
        socket.join(codice);
        socket.data.stanza = codice;

        trasmettiLobby(codice);
    });

    socket.on("iniziaPartita", (ruoliScelti) => {
        const ruoliAssegnati = mescolaRuoli(ruoliScelti);
        
        const stanza = socket.data.stanza;
        const giocatori = Object.values(stanza.giocatori)
        for(const i = 1; i < giocatori.length; i++){
            giocatori[i].ruolo = ruoliAssegnati[i - 1];
        }

        socket.join(giocatori);

        io.to(socket.data.stanza).emit("assegnazioneRuoli", {giocatori});        
    })

    socket.on("disconnect", () => {
        const codice = socket.data.stanza;
        if(!codice || !stanze[codice]) return;

        delete stanze[codice].giocatori[socket.id];
        if(Object.keys(stanze[codice].giocatori).length === 0){
            delete stanze[codice];
        }else {
            trasmettiLobby(codice);
        }
    });
});

function trasmettiLobby(codice){
    const stanza = stanze[codice];
    if(!stanza) return;
    const elenco = Object.values(stanza.giocatori).map(g => ({
        nome: g.nome,
        host: g.host,
    }));
    io.to(codice).emit("aggiornaLobby", { codice, giocatori: elenco });
}

function mescolaRuoli(ruoli) {
    for(let i = ruoli.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1))
        [ruoli[i], ruoli[j] = ruoli[j], ruoli[i]];
    }
    return array;
}

server.listen(porta, () => {
    console.log(`Server in ascolto su http://localhost:${porta}`)
})