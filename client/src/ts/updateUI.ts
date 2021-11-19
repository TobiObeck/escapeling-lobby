// content container
const joinContainer = (document.getElementById("join-container") as HTMLDivElement)
const chatContainer = (document.getElementById("chat-container") as HTMLDivElement)

export function updateUiShowRoom(chatHistory: Array<string>){
    console.log('show room')
    joinContainer.classList.add("hidden");
    chatContainer.classList.remove("hidden")

    console.log('chatHistory', chatHistory)
}

export function updateUiShowStartScreen(){
    console.log('show startscreen')
    joinContainer.classList.remove("hidden");
    chatContainer.classList.add("hidden")
}