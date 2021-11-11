import { Machine, assign } from "xstate";
// ES6 import or TypeScript
import { io } from "socket.io-client";

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
export interface LobbyContext {
    username: string,
    lobbyname: string,
    connection: null | ReturnType<typeof io>
}

export const lobbyMachine = Machine<LobbyContext, LobbySchema, LobbyEvent>({
    id: "lobby",
    context: {
        username: "",
        lobbyname: "",
        connection: null
    },
    initial: "startscreen",
    states: {
        startscreen: {
            on: {
                enter: {
                    cond: (ctx) => ctx.username != "" && ctx.lobbyname != "",
                    target: "room",
                    actions: [
                        assign({
                            connection: (ctx, event) => {

                                const socket = io("http://127.0.0.1:5000/");

                                socket.on("connect", () => {
                                    socket.emit('join', {
                                        userid: socket.id,
                                        username: ctx.username
                                    });        
                                });

                                return socket
                            }
                        })
                    ]
                },
                "name.change": {
                    actions: [
                        assign({
                            username: (ctx, event) => {                                
                                return event.value
                            }
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
