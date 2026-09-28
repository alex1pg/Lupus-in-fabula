const socket = io();

socket.on("connect", () => {
    console.log("Connesso al server con id:", socket.id);
});

const schermataIniziale = document.getElementById("schermataIniziale");
const lobby = document.getElementById("lobby");
const listaGiocatori = document.getElementById("listaGiocatori");
const codiceStanzaEl = document.getElementById("codiceStanza");
const inputNome = document.getElementById("inputNome");
const inputCodice = document.getElementById("inputCodice");
const bottoneCrea = document.getElementById("btnCrea");
const bottoneUnisciti = document.getElementById("btnUnisciti");
const bottoneInizia = document.getElementById("btnInizia");

bottoneCrea.addEventListener("click", () => {
  const nome = inputNome.value.trim();
  if (!nome) return alert("Inserisci un nome");
  socket.emit("creaStanza", { nome });
});

bottoneUnisciti.addEventListener("click", () => {
    const nome = inputNome.value.trim();
    const codice = inputCodice.value.trim();
    if(!nome ) return alert("Inserisci un nome valido.");
    if(!codice) return alert("Inserisci un codice valido.");

    socket.emit("unisci", { nome, codice });
});

bottoneInizia.addEventListener("click", () => {
    socket.emit("iniziaPartita");
});

socket.on("stanzaCreata", ({ codice }) => {
    console.log("Stanza creata con codice:", codice);

    schermataIniziale.style.display = "none";
    lobby.style.display = "block";
    codiceStanzaEl.textContent = codice;

    bottoneInizia.disabled = false;
});

socket.on("aggiornaLobby", ({ codice, giocatori }) => {
    schermataIniziale.style.display = "none";
    lobby.style.display = "block";
    codiceStanzaEl.textContent  = codice;

    listaGiocatori.innerHTML = "";
    giocatori.forEach( g => {
        const li = document.createElement("li");
        li.textContent = g.nome + (g.host ? " (host)" : "");
        listaGiocatori.appendChild(li);
    });
});

socket.on("errore", (messaggio) => {
  alert(messaggio);
});