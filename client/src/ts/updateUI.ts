import { ChatPayload } from "./LobbyMachine";

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

export function updateUiChatMessage(chatHistory: Array<ChatPayload>){
    const chatMsgContainer = <HTMLDivElement>document.querySelector('.chat-messages')
    
    // reset previous chat history that was already printed
    chatMsgContainer.innerHTML = ''
    
    // compose chat message
    for(let i = 0; i < chatHistory.length; i++){
        const item = chatHistory[i]
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