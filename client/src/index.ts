import './styles/index.scss'
import { interpret } from 'xstate'
import { lobbyMachine, LobbyContext } from './ts/LobbyMachine'

// interactable UI elements
const usernameInp = (document.querySelector("#username-input") as HTMLInputElement)
const roomSel = (document.querySelector("#room-select") as HTMLSelectElement)
const joinRoomBtn = (document.getElementById("join-room-btn")  as HTMLButtonElement)
const leaveRoomBtn = (document.getElementById("leave-room-btn") as HTMLButtonElement)

const msgInp = (document.getElementById("msg") as HTMLInputElement)
const msgSendBtn = (document.getElementById("msg-send") as HTMLButtonElement)

// TODO replace with factory function
// so that only dynamic context value need to be passed
// https://xstate.js.org/docs/guides/context.html#initial-context
const initialContext: LobbyContext = {
    username: usernameInp.value,
    lobbyname: roomSel.value,
    io: null,
    msg: '',
    roomId: null,
    chatHistory: []
}

const lobbyService = interpret(lobbyMachine.withContext(initialContext))
    .onTransition(function(state){
        console.log('curr state: ', state.value, state.context)

        switch (state.value) {
            // case 'startscreen':
            //     break; 
        }
    })
    .start();

// @ts-ignore
document.debugLobbyService = lobbyService

// on join room button click, try to connect and enter room
joinRoomBtn.addEventListener('click', function () {
    lobbyService.send('enter')
});

// on leave room button click, try disconnect and leave the room
leaveRoomBtn.addEventListener('click', function () {
    lobbyService.send('back')
});

// on inputting text, update the context state 
// (saving internal var in statemachine)
usernameInp.addEventListener("input", (event) => {
    lobbyService.send({
        type: "name.change",
        value: (event.target as HTMLInputElement).value
    });
});

// on changing a room in the select dropw down, update the context state 
// (saving internal var in statemachine)
roomSel.addEventListener("change", (event) => {
    lobbyService.send({
        type: "select.room",
        value: (<HTMLInputElement>event.target).value
    });
});

// on inputting text, update the context state 
// (saving internal var in statemachine)
msgInp.addEventListener("input", (event) => {
    lobbyService.send({
        type: "msg.change",
        value: (event.target as HTMLInputElement).value
    });
});

// on enter, send chat message
msgInp.addEventListener('keydown', (event) => {
    const ENTER_KEY = 'Enter'
    if (event.key === ENTER_KEY || event.code === ENTER_KEY) {
        lobbyService.send('send.msg')
    }
})

// on send button click, send chat message
msgSendBtn.addEventListener('click', function () {
    lobbyService.send('send.msg')
});
