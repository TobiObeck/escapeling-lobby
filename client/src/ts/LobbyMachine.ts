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
    | { type: "msg.change", value: string }
    | { type: "send.msg", value: string }


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
        startscreen: {
            on: {
                enter: {
                    cond: (ctx) => ctx.username != "" && ctx.lobbyname != "",
                    target: "room",
                    actions: [
                        assign({
                            io: (ctx, event) => {
                                
                                const socket = io("http://127.0.0.1:5000/");

                                // const receiveRoomIdCallback = function(roomId: string){
                                //     assign({
                                //         roomId: roomId
                                //     })
                                // }
                                
                                socket.on("connect", function(){

                                    console.log("args")

                                    socket.emit('join', {
                                        userid: socket.id,
                                        username: ctx.username,
                                        // roomId: arguments[0]
                                    });
                                });

                                socket.on("user-connected", (arg) => {

                                    console.log("user connected!!!", arg)
                                });

                                // socket.on("disconnect", () => {
                                //     console.log(socket.connected); // false
                                // });

                                // TODO handle connection error
                                // what should happen if the connection
                                // is not possible (e.g. server is not running)?

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
