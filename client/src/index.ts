import './styles/index.scss'
import './images/lobby_logo.png'
import './images/admin_crown.png'

import { interpret } from 'xstate'
import { createLobbyMachine } from './ts/LobbyMachine'
import { JOIN_ROOM_BTN_ID } from './ts/Constants'

const IS_DEBUGGING = false

// interactable UI elements
const joinRoomBtn = (document.getElementById(JOIN_ROOM_BTN_ID) as HTMLButtonElement)
const usernameInp = (document.querySelector('#username-input') as HTMLInputElement)
if(IS_DEBUGGING){
    usernameInp.value = 'debug' // FIXME TODO  debugging
}
const roomSel = (document.querySelector('#room-select') as HTMLSelectElement)
const leaveRoomBtn = (document.getElementById('leave-room-btn') as HTMLButtonElement)

const msgInp = (document.getElementById('msg') as HTMLInputElement)
const msgSendBtn = (document.getElementById('msg-send') as HTMLButtonElement)

const instructionsDisplayBtn = (document.getElementById('display-instructions-btn') as HTMLInputElement)
const instructionsCloseBtn = (document.getElementById('collapse-instructions-btn') as HTMLInputElement)


const lobbyMachine = createLobbyMachine(usernameInp.value, roomSel.value)
const lobbyService = interpret(lobbyMachine)
    .onTransition(function(state){
        if(state.changed){
            console.log('state', state.value, "ctx", state.context)            
        }

        switch (state.value) {
            // case 'startscreen':
            //     break; 
        }
    })
    .start();

if(IS_DEBUGGING){
    lobbyService.send('join') // FIXME just for debugging
}

// @ts-ignore
document.debugLobbyService = lobbyService

// on join room button click, try to connect and enter room
joinRoomBtn.addEventListener('click', function () {
    lobbyService.send('join')
});

// on leave room button click, try disconnect and leave the room
leaveRoomBtn.addEventListener('click', function () {
    lobbyService.send('back')
});

// on inputting text, update the context state 
// (saving internal var in statemachine)
usernameInp.addEventListener('input', (event) => {
    lobbyService.send({
        type: 'name.change',
        value: (event.target as HTMLInputElement).value
    });
});

// on pressing enter key in the name text field, send lobby join
usernameInp.addEventListener('keydown', (event) => {
    const ENTER_KEY = 'Enter'
    if (event.key === ENTER_KEY || event.code === ENTER_KEY) {
        lobbyService.send('join')
    }
})

// on changing a room in the select dropw down, update the context state 
// (saving internal var in statemachine)
roomSel.addEventListener('change', (event) => {
    lobbyService.send({
        type: 'select.room',
        value: (<HTMLInputElement>event.target).value
    });
});

// on inputting text, update the context state 
// (saving internal var in statemachine)
msgInp.addEventListener('input', (event) => {
    lobbyService.send({
        type: 'msg.change',
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

// start giving mission instructions when start clicked
instructionsDisplayBtn.addEventListener('click', function(event) {
    lobbyService.send('show.instructions')
});

instructionsCloseBtn.addEventListener('click', function(event) {
    console.log('closing machine side')
    lobbyService.send('collapse.instructions')
});

// window.addEventListener('beforeunload', function (e) {
//     // Cancel the event
//     e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown

//     // Chrome requires returnValue to be set
//     e.returnValue = 'no';
// });