import { ChatPayload, User } from "./LobbyMachine";
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

export function updateUiUsersInRoom(users: User[]){    
    const userCount = document.getElementById("usercount");    
    userCount.innerHTML = users.length + "/4";
      
    var ul = document.getElementById("users");
    ul.innerHTML = ''
    for (let i = 0; i < users.length; i++) {
        if (users[i].is_admin){
            var li = document.createElement("li");
            li.innerHTML = '<i class="fas fa-crown" style="color: #ed5;"></i> ' + users[i].name
            ul.appendChild(li)
        } else {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(users[i].name));
            ul.appendChild(li)            
        }
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

        let messageContent = ''

        let div = document.createElement("div");
        div.classList.add('message')
        
        if (item.type === 'user-joined' || item.type === 'user-left'){
            const joinedOrLeft =  item.type === 'user-joined'? 'joined' : 'left'
            messageContent =`                        
            <p class="text"><i>${item.username} just ${joinedOrLeft} the chat!</i></p>`
            div.classList.add('user-joined')
        } 
        else {
            messageContent = `
            <p class="meta">${item.username} <span>${item.time}</span></p>
            <p class="text">${item.msg}</p>`
        }
        div.innerHTML = messageContent
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

export function updateUiShowInstructions(){
    const instructionsField = (document.getElementById('instructions-container') as HTMLInputElement)
    const instructionBtn = (document.getElementById('display-instructions-btn') as HTMLInputElement)
    instructionBtn.classList.add('used');
    instructionsField.classList.remove('hidden');
}

export function updateUiCollapseInstructions(){
    const instructionsField = (document.getElementById('instructions-container') as HTMLInputElement)
    const instructionBtn = (document.getElementById('display-instructions-btn') as HTMLInputElement)
    instructionBtn.classList.remove('used');
    instructionsField.classList.add('hidden');
}

export function updateUisetInstructionText(isAdmin: boolean | null, username: string) {
    const instructionsText = (document.getElementById('instructions-txt') as HTMLInputElement)        
    
    const adminInstructions = `Hello ${username},</br>
    you are the admin <i class="fas fa-crown"></i>! You need to create a new Escapeling game for your group. Just follow these instructions: 
    <ol>
      <li><b>Click</b> on the <a href="https://t.me/Escapeling_Bot" target="_blank" rel="noopener noreferrer">Telegram chat</a> link to open the Game.</li>
      <li>Start the adventure by sending the message <b>\'/start\'</b> into the Telegram chat bot.</li>
      <li>Then you will be asked to \'<b>create a group</b>\'.</li>
      <li><b>Copy</b> the <b>registration code</b> and paste it here into the lobby chat so others can join your adventure.</li>
    </ol>Have fun and enjoy the Game! 😀`
    
    const nonAdminInstructions = `Hello ${username},</br>
    your Escapeling mission will start in a moment. Just follow these instructions:
    <ol>
      <li>Wait for the <b>Admin</b> <i class="fas fa-crown"></i> to post the <b>registration code</b> into the chat (or maybe remind him of it).</li>
      <li>Copy the <b>registration code</b> and open the <a href="https://t.me/Escapeling_Bot" target="_blank" rel="noopener noreferrer">Telegram chat</a> bot by clicking on the link .</li>
      <li>Activate the bot by sending the message <b>\'/start\'</b> into the Telegram chat.</li>            
      <li>Then you will be asked to \'<b>join a group</b>\'.</li>
      <li><b>Paste</b> the <b>registration code</b> into the Telegram Chat</li>
    </ol>Have fun and enjoy the Game! 😀`
  
    if (isAdmin == true) {
        instructionsText.innerHTML = adminInstructions;
    } else if(isAdmin == false) {
        instructionsText.innerHTML = nonAdminInstructions;
    }
}

export function updateUiHandleAutoinstructions(showInstructions: boolean){  
    if (showInstructions) {
        console.log('update ui for instructions', showInstructions);
        updateUiShowInstructions();
    }
}

export function updateUiJoinButton(){
    const instructionBtn = (document.getElementById('join-room-btn') as HTMLInputElement)
    instructionBtn.innerHTML = 'Join Chat'
}
