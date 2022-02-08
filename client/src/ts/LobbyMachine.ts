import { Machine, assign, createMachine, EventObject } from 'xstate';
// ES6 import or TypeScript
import { io } from 'socket.io-client';
import { 
    updateUiShowRoom,
    updateUiShowStartScreen,
    updateUiChatMessage,
    updateUiClearChatMessageInput,
    updateUiJoinBtnConnectLoading,
    updateUiUsersInRoom,
    updateUiShowInstructions,
    updateUiCollapseInstructions,
    updateUisetInstructionText,
    updateUiHandleAutoinstructions,
    updateUiJoinButtonNeutral,
    updateUiRoomName
} from './updateUI';

export interface ChatPayload {
    'time': string,
    'username': string,
    'msg': string,
    'type': string
}

export interface User {    
    'name': string
    'id': string
    'is_admin': boolean    
}
interface ConnectedPayload {
    'username': string
    'chathistory': ChatPayload[],
    'isadmin': boolean,
    'users': User[],
    'showinstructionslocally': boolean,
    'showinstructionsglobally': boolean,
    'roomname': string
}

interface DisconnectedPayload {
    'username': string
    'chathistory': ChatPayload[],
    // 'isadmin': boolean,
    'users': User[],
    'showinstructionslocally': boolean,
    'showinstructionsglobally': boolean,    
}

export interface LobbySchema {
    states: {
        startscreen: {};
        errorscreen: {};
        connecting: {};
        connected:{};
        room: {}
        // room: {
        //     // 'waiting-for-players': {},
        //     // 'ready-to-play': {}
        // };
    };
}

// The events that the machine handles
type LobbyEvent =
    { type: 'join'}
    | { type: 'back' }
    | { type: 'name.change', value: string }
    | { type: 'select.room', value: string }
    | { type: 'msg.change', value: string }
    | { type: 'send.msg', value: string }
    | { type: 'connect' }
    | { type: 'error' }    
    | { type: 'connection-established', value: ConnectedPayload } // TODO define data type sth like dictionary chathistory, name time
    | { type: 'message-received', value: ChatPayload }
    | { type: 'show.instructions'}
    | { type: 'collapse.instructions'}
    | { type: 'leave'}



// The context (extended state) of the machine
export interface LobbyContext {
    username: string,
    lobbyname: string, // TODO remove, not really used
    io: null | ReturnType<typeof io>,
    msg: string,
    roomId: null | string,
    chathistory: ChatPayload[],
    users: User[],
    isadmin: boolean,
}

export const createLobbyMachine = (usernameInpValue: string, roomSelValue: string) => {

    const initialContext: LobbyContext = {
        username: usernameInpValue,
        lobbyname: roomSelValue, // TODO remove, not really used
        io: null,
        msg: '',
        roomId: null,
        chathistory: [],
        users: [],
        isadmin: null
    }

    // TODO update typescript types for machine
    const lobbyMachine = createMachine<LobbyContext, any>({ // LobbySchema, //FIXME TODO add LobbyEvent type
    // const lobbyMachine = createMachine<LobbyContext, LobbyEvent>({ // LobbySchema,
        id: 'lobby',
        context: initialContext,
        initial: 'startscreen',
        states: {
            // start screen state
            startscreen: {
                entry: [
                    // having this commented in somehow causes
                    // errors when emmitting disconnect from the
                    // previous state. No idea why this entry assign
                    // is applied before actions from prev state
                    // assign({
                    //     username: usernameInpValue,
                    //     lobbyname: roomSelValue, // TODO remove, not really used
                    //     io: null,
                    //     msg: '',
                    //     roomId: null,
                    //     chathistory: [],
                    //     users: [],
                    //     isadmin: null
                    // }),
                    (ctx, _) => {
                        console.log('start context', ctx)
                        updateUiShowStartScreen()
                        updateUiJoinButtonNeutral()
                    },
                ],
                on: {
                    // when in startscreen and enter event is fired
                    'join': {
                        cond: (ctx) => ctx.username != '' && ctx.lobbyname != '',                    
                        target: 'connecting', // target state             
                    },
                    // on name.change event, update context state username
                    // with username from UI
                    'name.change': {
                        actions: [
                            assign({
                                username: (ctx, event) => {                                
                                    return event.value
                                }
                            })]
                    },
                    // on select.room event, update context state lobbyname
                    // with selected room from UI
                    'select.room': { // TODO remove, not really used
                        actions: [                        
                            assign({
                                lobbyname: (ctx, event) => event.value
                            })]
                    }
                },
            },
            connecting: {
                entry: (ctx, _) => updateUiJoinBtnConnectLoading(),
                // TODO instead of promise, rewrite with callback service
                invoke: {
                    id: 'connecter',
                    src: (ctx, event) => {                        

                        const socket = io(process.env.SERVER_URL);
    
                        return new Promise((resolve, reject) => {
                            socket.on('connect', function(){
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
                        target: 'connected',
                        actions: [
                            assign({ io: (ctx, event) => event.data }),
                            (ctx, event) => {
                                ctx.io.emit('join', {
                                    userid: ctx.io.id,
                                    username: ctx.username,
                                });
                            }
                        ]
                    }
                    // onError: {
                    //     target: 'errorscreen',
                    //     // actions: assign({ error: (context, event) => event.data })
                    // }             
                },
            },
            errorscreen: {
                entry: () => {
                    // TODO currently this state is never reached
                    console.log('EROROR EROROR EROROR EROROR EROROR ')
                    document.write('error lol')
                }
            },
            connected:{
                initial: 'waiting',
                invoke: [
                    {
                        id: 'connecter',
                        src: (ctx, event) => (callback, onReceive) => {
                            ctx.io.on('user-connected', (arg: ConnectedPayload) => {
                                
                                console.log('user connected!!!', arg)
                                // console.log('previous chathistory', arg['chathistory'])
                                console.log('username', arg['username'])
                            
                                const connectedPayload: ConnectedPayload = {                            
                                    username: arg['username'],
                                    chathistory: arg['chathistory'],
                                    isadmin: arg['isadmin'],
                                    users: arg['users'],
                                    showinstructionslocally: arg['showinstructionslocally'],
                                    showinstructionsglobally: arg['showinstructionsglobally'],
                                    roomname: arg['roomname'],
                                }
        
                                callback({ type: 'new-user-joined', value: connectedPayload })
                            })
                        }
                    },
                    {
                        id: 'disconnecter',
                        src: (ctx: LobbyContext, event) => (callback, onReceive) => {
                            ctx.io.on('disconnect', function(reason: string){
                                console.log(`User ${ctx.username} disconnected :/`, reason) // transport close
                                                                
                                callback({ type: 'leave' })
                            })
                        }
                    },
                    {
                        id: 'other-user-disconnected',
                        src: (ctx, event) => (callback, onReceive) => {
                            ctx.io.on('user-disconnected', (disconnected_payload: DisconnectedPayload) => {
                                console.log('user-disconnected! Payload:', disconnected_payload)
                                callback({ type: 'a-user-left', value: disconnected_payload })
                            });
                        }
                    }
                ],
                on: {
                    leave: {
                        target: 'startscreen'
                    }
                },
                states:{
                    waiting:{
                        on: {
                            // hanle successfull join for a local user
                            'new-user-joined': { 
                                target: 'room',                    
                                actions: [
                                    assign({
                                        chathistory: (_, event: { value: ConnectedPayload } & EventObject) => {                                           
                                            return event.value.chathistory
                                        },
                                        users: (_, event: { value: ConnectedPayload } & EventObject) => { 
                                            return event.value.users
                                        },
                                        isadmin: (_, event: { value: ConnectedPayload } & EventObject) => { 
                                            return event.value.isadmin
                                        }
                                    }),
                                    
                                    // logging stuff
                                    () => {
                                        console.log('THIS IS ONLY LOGGED WHEN THE CURRENT USER JOIN');
                                        console.log('BUT NOT WHEN OTHERS JOIN, WHICH IS BAD');
                                    },
                                    
                                    // update UI stuff
                                    (ctx, event: { value: ConnectedPayload } & EventObject) => {
                                        updateUisetInstructionText(event.value.isadmin, ctx.username),
                                        updateUiHandleAutoinstructions(event.value.showinstructionslocally),
                                        updateUiUsersInRoom(ctx.users),
                                        updateUiRoomName(event.value.roomname),
                                        updateUiChatMessage(ctx.chathistory)
                                    }
                                ]
                            }
                        }
                    },
                    room:{
                        entry: [
                            (ctx, _) => updateUiShowRoom(),
                        ],
                        invoke: {
                            id: 'msghandler',
                            src: (ctx, event) => (callback, onReceive) => {            
                                ctx.io.on('broadcast-message', function(args: ChatPayload){            
                                    if(args.msg != null && args.msg.length != 0){                            
                                        callback({ type: 'message-received', value: args })
                                    }
                                })
                            }
                        },
                        on: {
                            'message-received': {
                                actions: [
                                    assign({
                                        chathistory: (ctx, event) => {  
                                            return [...ctx.chathistory, event.value]
                                        }
                                    }),
                                    (ctx, _) => {
                                        updateUiChatMessage(ctx.chathistory)
                                    }
                                ],
                            },                          
                            'back': {                                
                                target: '#lobby.startscreen',
                                actions: [
                                    (ctx: LobbyContext, event) => {
                                        console.log(ctx)
                                        // ctx.io.emit('end-connection')
                                        ctx.io.disconnect()
                                        console.log("User left room and closed websocket connection")                                        
                                    }
                                ],
                            },
                            'msg.change': {
                                actions: [
                                    assign({
                                        msg: (ctx, event) => {                                
                                            return event.value
                                        }
                                    })]
                            },
                            'send.msg': {
                                cond: (ctx) => ctx.msg != null && ctx.msg !== '',
                                actions: [
                                    'sendMessage',
                                    // clearing the context.msg value
                                    // is done manually by firing an input event
                                    updateUiClearChatMessageInput
                                ]
                            },
                            'show.instructions': {
                                actions: [
                                    (ctx, _) => {
                                        //check if enough people in room
                                        console.log('show instruction')
                                        updateUiShowInstructions()
                                    }
                                ]
                            }, 
                            'collapse.instructions': {
                                actions: [
                                    (ctx, _) => {
                                        console.log('machine')
                                        updateUiCollapseInstructions()
                                    }
                                ]
                            },        
                            'new-user-joined': { // remote user, external user joined
                                actions: [
                                    assign({
                                        chathistory: (ctx, event: { value: ConnectedPayload } & EventObject) => {
                                            return event.value.chathistory
                                        },                                             
                                        users: (ctx, event: { value: ConnectedPayload } & EventObject) => { 
                                            return event.value.users
                                        },
                                    }),
                                    (ctx: LobbyContext, event: { value: ConnectedPayload } & EventObject) => {
                                        updateUiChatMessage(ctx.chathistory),
                                        updateUiUsersInRoom(ctx.users),
                                        updateUiRoomName(event.value.roomname),
                                        updateUiHandleAutoinstructions(event.value.showinstructionsglobally)
                                    },
                                    () => {
                                        console.log('USER IS ALREADY IN ROOM! ACTION FIRED');
                                    }
                                ]
                            },
                            'a-user-left': {
                                actions: [
                                    assign({
                                        chathistory: (_, event: { value: DisconnectedPayload } & EventObject) => {
                                            return event.value.chathistory
                                        },                                             
                                        users: (_, event: { value: DisconnectedPayload } & EventObject) => { 
                                            return event.value.users
                                        },
                                        isadmin: (ctx, event: { value: DisconnectedPayload } & EventObject) => {

                                            console.log("isadmin event", event)
                                            console.log(event.value.users)
                                            
                                            let tempUser = null
                                            for(let i = 0; i < event.value.users.length; i++){

                                                console.log(ctx.io.id, event.value.users[i].id)

                                                if(ctx.io.id == event.value.users[i].id){                                                
                                                    console.log('MATCH!!!')
                                                    tempUser = event.value.users[i]
                                                }                                                
                                            }

                                            return tempUser.is_admin                                            
                                        }
                                    }),
                                    (ctx: LobbyContext, event) => {
                                        updateUiChatMessage(ctx.chathistory),
                                        updateUiUsersInRoom(ctx.users),
                                        updateUiHandleAutoinstructions(event.value.showinstructionsglobally),
                                        updateUisetInstructionText(ctx.isadmin, ctx.username)
                                    },
                                ]
                            }
                        }

                    }
                }
            },
        },
    },
    {
        actions: {
            sendMessage: (ctx, event) => {
                ctx.io.emit('send_message', {
                    'userId': ctx.io.id,
                    'username': ctx.username,
                    'msg': ctx.msg
                })
            }
        }
    });

    return lobbyMachine
}
