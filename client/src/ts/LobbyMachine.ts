import { Machine, assign } from "xstate";

export interface LobbySchema {
    states: {
        startscreen: {};
        room: {};
    };
}

// The events that the machine handles
type LobbyEvent =
    { type: "enter"}
    | { type: "back" }
    | { type: "name.change", value: string }
    | { type: "select.room", value: string }


// The context (extended state) of the machine
interface LobbyContext {
    username: string,
    lobbyname: string,
}

export const lobbyMachine = Machine<LobbyContext, LobbySchema, LobbyEvent>({
    id: "lobby",
    context: {
        username: "",
        lobbyname: ""
    },
    initial: "startscreen",
    states: {
        startscreen: {
            on: {
                enter: {
                    cond: (ctx) => ctx.username != "" && ctx.lobbyname != "",
                    target: "room",                    
                },
                "name.change": {
                    actions: [
                        assign({
                            username: (ctx, event) => event.value
                        })]
                },
                "select.room": {
                    actions: [                        
                        assign({
                            lobbyname: (ctx, event) => event.value
                        })]
                }
            },
        },
        room: {
            on: {
                back: "startscreen",
            },
        },
    },
});
