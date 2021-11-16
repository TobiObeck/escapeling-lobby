import { Machine, assign, send, sendParent } from "xstate";
// ES6 import or TypeScript
import { io } from "socket.io-client";

export interface LobbySchema {
    states: {
        startscreen: {};
        errorscreen: {};
        connecting: {};
        room: {};
    };
}

// The events that the machine handles
type LobbyEvent =
    { type: "enter"}
    | { type: "back" }
    | { type: "name.change", value: string }
    | { type: "select.room", value: string }
    | { type: "msg.change", value: string }
    | { type: "send.msg", value: string }
    | { type: "connect" }
    | { type: "error" }


// The context (extended state) of the machine
export interface LobbyContext {
    username: string,
    lobbyname: string,
    io: null | ReturnType<typeof io>,
    msg: string,
    roomId: null | string
}

export const lobbyMachine = Machine<LobbyContext, LobbySchema, LobbyEvent>({
    id: "lobby",
    context: {
        username: "",
        lobbyname: "",
        io: null,
        msg: "",
        roomId: null
    },
    initial: "startscreen",
    states: {
        // start screen state
        startscreen: {
            on: {
                // when in startscreen and enter event is fired
                enter: {
                    cond: (ctx) => ctx.username != "" && ctx.lobbyname != "",
                    target: "connecting", // target state             
                },
                // on name.change event, update context state username
                // with username from UI
                "name.change": {
                    actions: [
                        assign({
                            username: (ctx, event) => {                                
                                return event.value
                            }
                        })]
                },
                // on select.room event, update context state lobbyname
                // with selected room from UI
                "select.room": {
                    actions: [                        
                        assign({
                            lobbyname: (ctx, event) => event.value
                        })]
                }
            },
        },
        connecting: {
            invoke: {
                id: 'connecter',
                src: (ctx, event) => {
                    const socket = io("http://127.0.0.1:5000/");

                    return new Promise((resolve, reject) => {
                        socket.on("connect", function(){
                            if(socket.id != null){
                                resolve(socket)
                            }                            
                            else { // This else is never reached.
                                // Either it connects and has an id or it doesn't at all
                                reject('some connection error, lol');
                            }
                        })
                    });
                },
                onDone: {
                    target: 'room',
                    actions: assign({ io: (ctx, event) => event.data })
                },
                onError: {
                    target: 'errorscreen',
                    // actions: assign({ error: (context, event) => event.data })
                }             
            }
        },
        errorscreen: {
            entry: () => {
                // TODO currently this state is never reached
                console.log('EROROR EROROR EROROR EROROR EROROR ')
                document.write('error lol')
            }
        },
        room: {
            entry: [
                (ctx, event) => {
                    ctx.io.emit('join', {
                        userid: ctx.io.id,
                        username: ctx.username,
                        // roomId: arguments[0]
                    });

                    ctx.io.on("user-connected", (arg) => {
                        console.log("user connected!!!", arg)
                    });
                }
            ],
            on: {                
                back: "startscreen",
                "msg.change": {
                    actions: [
                        assign({
                            msg: (ctx, event) => {                                
                                return event.value
                            }
                        })]
                },
                "send.msg": {
                    actions: ['sendMessage']
                }
            },
        },
    },
},
{
    actions: {
        sendMessage: (ctx, event) => {
            ctx.io.emit('send_message', {
                "username": ctx.username,
                "msg": ctx.msg
            })
        }
    }
});
