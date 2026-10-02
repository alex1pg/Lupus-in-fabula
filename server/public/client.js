const socket = io();

socket.on("connect", () => {
    console.log("Connesso al server con id:", socket.id);
});

let SetRuoli = {};

const schermataIniziale = document.getElementById("schermataIniziale");
const lobby = document.getElementById("lobby");
const listaGiocatori = document.getElementById("listaGiocatori");
const codiceStanzaEl = document.getElementById("codiceStanza");
const inputNome = document.getElementById("inputNome");
const inputCodice = document.getElementById("inputCodice");
const bottoneCrea = document.getElementById("btnCrea");
const bottoneUnisciti = document.getElementById("btnUnisciti");
const bottoneInizia = document.getElementById("btnInizia");
const listaRuoli = document.getElementById("listaRuoli");

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
    const ruoliScelti = Object.entries(SetRuoli)
        .flatMap(([categoria, ruoliLista]) => 
            ruoliLista
            .filter(r => r.presente === true)
            .map(r => ({...r, categoria}))
        );
    
    socket.join(ruoliScelti);
    socket.emit("iniziaPartita");
});

socket.on("stanzaCreata", ({ codice, ruoli }) => {
    console.log("Stanza creata con codice:", codice);

    schermataIniziale.style.display = "none";
    lobby.style.display = "block";
    codiceStanzaEl.textContent = codice;

    listaRuoli.innerHTML = "";

    SetRuoli = ruoli;
    
    for(const allineamento in SetRuoli){
        const div = document.createElement("div");

        const Allineamento = document.createElement("h2");
        Allineamento.innerHTML = allineamento;


        const ul = document.createElement("ul");
        for(const ruolo of SetRuoli[allineamento]){
            const li = document.createElement("li");

            const nomeRuolo = document.createElement("h4");
            nomeRuolo.innerHTML = ruolo.nome;

            const presente = document.createElement("input");
            presente.type = "checkbox";
            presente.checked = ruolo.presente;
            presente.addEventListener("change", () => {
                ruolo.presente = presente.checked;
            });

            const descrizione = document.createElement("p");
            descrizione.innerHTML = ruolo.descrizione;

            const div2 = document.createElement("div");
            div2.style.display = "flex";
            div2.style.height = "fit-content";

            li.appendChild(nomeRuolo);
            li.appendChild(presente);
            li.appendChild(descrizione);
            li.appendChild(div2);

            ul.appendChild(li);
        }

        div.appendChild(Allineamento);
        div.appendChild(ul);

        listaRuoli.appendChild(div);
    }

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

socket.on("assegnazioneRuoli", ({ giocatori }) => {
    schermataIniziale.style.display = "none";
    lobby.style.display = "block";
    codiceStanzaEl.textContent  = codice;

    listaGiocatori.innerHTML = "";
    giocatori.forEach( g => {
        const li = document.createElement("li");
        li.textContent = g.nome + (g.host ? " (host)" : "");
        listaGiocatori.appendChild(li);
    });
})

socket.on("errore", (messaggio) => {
  alert(messaggio);
});