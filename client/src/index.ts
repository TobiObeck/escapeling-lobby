import './styles/index.scss'
import { Machine, interpret } from 'xstate'
import { lobbyMachine, LobbySchema, LobbyContext } from './ts/LobbyMachine'

// interactable UI elements
const usernameInp = document.querySelector("#username-input");
const roomSel = document.querySelector("#room-select");
const enterChatSubmitBtn = document.getElementById("enterChatSubmitBtn")
const leaveRoomBtn = document.getElementById("leave-room-btn")

// content container
const joinContainer = document.getElementById("join-container")
const chatContainer = document.getElementById("chat-container")

const initialContext: LobbyContext = {
    username: "",
    lobbyname: (roomSel as HTMLInputElement).value,
    connection: null
}

const lobbyService = interpret(lobbyMachine.withContext(initialContext))
    .onTransition(function(state){
        console.log('curr state: ', state.value, state.context)

        console.log(state.matches(''));

        switch (state.value) {
            // case 'startscreen': 
            case 'room': updateUiShowRoom()
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
