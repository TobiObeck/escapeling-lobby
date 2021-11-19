// content container
const joinContainer = (document.getElementById('join-container') as HTMLDivElement)
const chatContainer = (document.getElementById('chat-container') as HTMLDivElement)

export function updateUiShowRoom(chatHistory: Array<string>){
    console.log('show room')
    joinContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden')

    console.log('chatHistory', chatHistory)
}

export function updateUiShowStartScreen(){
    console.log('show startscreen')
    joinContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden')
}

export function updateUiChatMessage(chatHistory: Array<any>){
    const chatMsgContainer = <HTMLDivElement>document.querySelector('.chat-messages')
    
    // reset previous chat history that was already printed
    chatMsgContainer.innerHTML = ''

    // compose chat message
    for(let i = 0; i < chatHistory.length; i++){
        const messagePair = chatHistory[i]

        // TODO the time should be determined when the message is sent 
        // to the server or when the server receives it
        const TODO_FIXME_dirtyhacklol = '' + new Date().getHours() + ':' 
        + new Date().getMinutes()

        const messageContent = ` 
        <p class="meta">${messagePair[0]} <span>${TODO_FIXME_dirtyhacklol}</span></p>
        <p class="text">${messagePair[1]}</p>`        

        var div = document.createElement("div");
        div.innerHTML = messageContent
        div.classList.add('message')
        chatMsgContainer.appendChild(div)
    }
}