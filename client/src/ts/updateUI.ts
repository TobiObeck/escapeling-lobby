import { ChatPayload } from "./LobbyMachine";
import { CHAT_MESSAGES, JOIN_ROOM_BTN_ID } from "./Constants";

// content container
const joinContainer = (document.getElementById('join-container') as HTMLDivElement)
const chatContainer = (document.getElementById('chat-container') as HTMLDivElement)

export function updateUiShowRoom(){
    console.log('show room')
    joinContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden')

    const msgInp = (document.getElementById('msg') as HTMLInputElement)
    msgInp.focus()
}

export function updateUiShowStartScreen(){
    console.log('show startscreen')
    joinContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden')
}
    
export function updateUiConnectLoading(){
    const joinRoomBtn = (document.getElementById(JOIN_ROOM_BTN_ID) as HTMLButtonElement)
    joinRoomBtn.innerHTML = 'Connecting...'
}

export function updateUiUsersInRoom(usercountinroom: number){    
    const userCount = document.getElementById("usercount");    
    userCount.innerHTML = usercountinroom + "/4";

    const usernames = ['duckface', 'smart person', 'birdperson', "kingen"] // FIXME TODO PLEASE ACRTUALLY USE ARAELY USERNAME OTHERWISE SOME KITTEN WILL DIE EVENTUALYIMMEITIALTYL  ALSO THE ILINE IS WHA Y TO LONG
    for (let i = 0; i < usernames.length; i++) {
        var ul = document.getElementById("users");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(usernames[i]));
        ul.appendChild(li)
    }
}

export function updateUiChatMessage(chathistory: Array<ChatPayload>){
    const chatMsgContainer = <HTMLDivElement>document.querySelector(CHAT_MESSAGES)
    
    // reset previous chat history that was already printed
    chatMsgContainer.innerHTML = ''
    
    // compose chat message
    for(let i = 0; i < chathistory.length; i++){
        const item = chathistory[i]
        // console.log('current message', i)

        const messageContent = ` 
        <p class="meta">${item.username} <span>${item.time}</span></p>
        <p class="text">${item.msg}</p>`        

        console.log(messageContent)

        var div = document.createElement("div");
        div.innerHTML = messageContent
        div.classList.add('message')
        chatMsgContainer.appendChild(div)
    }
}

export function updateUiClearChatMessageInput(){
    const msgInp = (document.getElementById('msg') as HTMLInputElement)
    msgInp.value = ''

    // this is a bit of a hack:
    // first the input value is reset (which is fine)
    // then an input event is triggered via code
    // so that XState receives an input event with the newly reset value
    // this was done, because XState 4.x priotizes assign actions. 
    // Clearing the context.msg would therefore
    // always lead to sending empty messages.
    // https://xstate.js.org/docs/guides/actions.html#action-order
    var event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });    
    msgInp.dispatchEvent(event);
}