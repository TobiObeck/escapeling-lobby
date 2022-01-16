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

export function updateUiUsersInRoom(usernames: string[]){    
    const userCount = document.getElementById("usercount");    
    userCount.innerHTML = usernames.length + "/4";
      
    var ul = document.getElementById("users");
    ul.innerHTML = ''
    for (let i = 0; i < usernames.length; i++) {
        if (i === 0){
            var li = document.createElement("li");
            li.innerHTML = '<i class="fas fa-crown" style="color: #ed5;"></i> ' + usernames[i]
            ul.appendChild(li)
        } else {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(usernames[i]));
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

        console.log(messageContent)
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
    const adminInstructions = `Hello ${username},</br> you have been selected to set up the Escapeling Game for you and your group members, just follow these instructions: <ol><li>Go to this website <a href="https://t.me/Escapeling_Bot">LINK</a> and open the Escapeling Chat within Telegram</li><li>To start the adventure send the message \'/start\' into the chat</li><li>From this point on Elias will guide you through the mission, tell him to "create a group"</li><li>Elias will create a registration code for your friends. As a last step send the code into your group chat</li></ol>Well done, you have successfully created a new mission for you and your friends and are all set up to start the adventure. Have fun and enjoy the Game.`
    const nonAdminInstructions = `Hello ${username},</br>you have chosen to go on a quest with your team mates, but at first, we will have to set up the game. There is not a lot to do from your side, follow these instructions and you will be all set up:<ol><li>Go to this website <a href="https://t.me/Escapeling_Bot">LINK</a> and open the Escapeling Chat within Telegram</li><li>To start the adventure send the message \'/start\' into the chat.</li><li>From this point on Elias will guide you through the mission, tell him to \'join a group\'</li><li>Wait for the Admin to post the registration code into the chat (or maybe remind him of it)</li><li>Provide Elias with the registration code by copying and pasting it to your Escapeling adventure.</li></ol>Well done, you have successfully joined the Escapeling game with your friends and are set up to start the adventure. Have fun and enjoy the Game.`
  
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