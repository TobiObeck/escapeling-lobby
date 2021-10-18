import './styles/index.scss'
import { Machine, interpret } from 'xstate'
import { lobbyMachine, LobbySchema } from './ts/LobbyMachine'

// ES6 import or TypeScript
import { io } from "socket.io-client";

// interactable UI elements
const usernameInp = document.querySelector("#username-input");
const roomSel = document.querySelector("#room-select");
const enterChatSubmitBtn = document.getElementById("enterChatSubmitBtn")
const leaveRoomBtn = document.getElementById("leave-room-btn")

// content container
const joinContainer = document.getElementById("join-container")
const chatContainer = document.getElementById("chat-container")

const initialContext = {
    username: "",
    lobbyname: (roomSel as HTMLInputElement).value
}

const lobbyService = interpret(lobbyMachine.withContext(initialContext))
    .onTransition(state => {
        console.log('curr state: ', state.value, state.context)

        console.log(state.matches(''));

        switch (state.value) {
            // case 'startscreen': 
            case 'room': enterRoom()
                break;
            case 'startscreen': updateUiShowStartScreen()
                break;
        }

    })
    .start();

function updateUiShowRoom(){
    console.log('show room')
    joinContainer.classList.add("hidden");
    chatContainer.classList.remove("hidden")
}

function updateUiShowStartScreen(){
    console.log('show startscreen')
    joinContainer.classList.remove("hidden");
    chatContainer.classList.add("hidden")
}

function enterRoom(){    
    updateUiShowRoom();
    startConnection();  
}

function startConnection(){

    // In case your front is not served from the same domain as your server, 
    // you have to pass the URL of your server. instead of const socket = io();
    const socket = io("http://127.0.0.1:5000/");

    socket.on("connect", () => {
        // ...
        console.log("connect connect connect")
        
        // socket.send('Xstate client has connected or sth')
        // socket.emit('my event', {data: 'I\'m connected!'});        
    });

    socket.on("data", () => { /* ... */ });
}


enterChatSubmitBtn.addEventListener('click', function () {
    lobbyService.send('enter')
});

leaveRoomBtn.addEventListener('click', function () {
    lobbyService.send('back')
});

usernameInp.addEventListener("input", (event) => {
    lobbyService.send({
        type: "name.change",
        value: (event.target as HTMLInputElement).value
    });
});

roomSel.addEventListener("change", (event) => {
    lobbyService.send({
        type: "select.room",
        value: (<HTMLInputElement>event.target).value
    });
});


