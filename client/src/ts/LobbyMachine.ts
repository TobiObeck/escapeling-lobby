import { Machine, assign, createMachine } from 'xstate';
// ES6 import or TypeScript
import { io } from 'socket.io-client';
import { 
    updateUiShowRoom,
    updateUiShowStartScreen,
    updateUiChatMessage,
    updateUiClearChatMessageInput,
    updateUiConnectLoading,
    updateUiUsersInRoom,
    updateUiShowInstructions,
    updateUiCollapseInstructions,
    updateUisetInstructionText,
    updateUiHandleAutoinstructions,
    updateUiJoinButton
} from './updateUI';

export interface ChatPayload {
    'time': string,
    'username': string,
    'msg': string,
    'type': string
}

interface ConnectedPayload {
    'username': string
    'chathistory': ChatPayload[],
    'isadmin': boolean,
    'usernames': string[],
    'showinstructionslocally': boolean,
    'showinstructionsglobally': boolean
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



// The context (extended state) of the machine
export interface LobbyContext {
    username: string,
    lobbyname: string,
    io: null | ReturnType<typeof io>,
    msg: string,
    roomId: null | string,
    chathistory: ChatPayload[],
    usernames: string[],
    isadmin: boolean
}

export const createLobbyMachine = (usernameInpValue: string, roomSelValue: string) => {

    const initialContext: LobbyContext = {
        username: usernameInpValue,
        lobbyname: roomSelValue,
        io: null,
        msg: '',
        roomId: null,
        chathistory: [],
        usernames: [],
        isadmin: null
    }

    // TODO update typescript types for machine
    const lobbyMachine = createMachine<any, any>({ // LobbySchema,
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
                    //     lobbyname: roomSelValue,
                    //     io: null,
                    //     msg: '',
                    //     roomId: null,
                    //     chathistory: [],
                    //     usernames: [],
                    //     isadmin: null
                    // }),
                    (ctx, _) => {
                        console.log('start context', ctx)
                        updateUiShowStartScreen()
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
                    'select.room': {
                        actions: [                        
                            assign({
                                lobbyname: (ctx, event) => event.value
                            })]
                    }
                },
            },
            connecting: {
                entry: (ctx, _) => updateUiConnectLoading(),
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
                            
                                const value: ConnectedPayload = {                            
                                    username: arg['username'],
                                    chathistory: arg['chathistory'],
                                    isadmin: arg['isadmin'],
                                    usernames: arg['usernames'],
                                    showinstructionslocally: arg['showinstructionslocally'],
                                    showinstructionsglobally: arg['showinstructionsglobally']
                                }
        
                                callback({ type: 'new-user-joined', value: value })
                            })
                        }
                    },
                    {
                        id: 'disconnecter',
                        src: (ctx: LobbyContext, event) => (callback, onReceive) => {
                            ctx.io.on('disconnect', function(reason: string){
                                console.log('Some user disconnected XXX', reason)
                                
                                // this somehow triggers leave for all users xD
                                // callback({ type: 'leave', value: reason })
                            })
                        }
                    },
                    {
                        id: 'other-user-disconnected',
                        src: (ctx, event) => (callback, onReceive) => {
                            ctx.io.on('user-disconnected', (userLeftPayload: any) => {
                                console.log('user-disconnected! Payload:', userLeftPayload)
                                callback({ type: 'a-user-left', value: userLeftPayload })
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
                                        chathistory: (ctx, event: { value: ConnectedPayload }) => {
                                            return event.value.chathistory
                                        },
                                        usernames: (ctx, event: { value: ConnectedPayload }) => { 
                                            return event.value.usernames
                                        },
                                        isadmin: (ctx, event: { value: ConnectedPayload }) => { 
                                            return event.value.isadmin
                                        }
                                    }),
                                    
                                    // logging stuff
                                    () => {
                                        console.log('THIS IS ONLY LOGGED WHEN THE CURRENT USER JOIN');
                                        console.log('BUT NOT WHEN OTHERS JOIN, WHICH IS BAD');
                                    },
                                    
                                    // update UI stuff
                                    (ctx, event) => {
                                        updateUisetInstructionText(event.value.isadmin, ctx.username),
                                        updateUiHandleAutoinstructions(event.value.showinstructionslocally),
                                        updateUiUsersInRoom(ctx.usernames),
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
                                        ctx.io.emit('end-connection')
                                        ctx.io.disconnect()
                                        console.log("User left room and closed websocket connection")
                                        updateUiJoinButton()
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
                                        chathistory: (ctx, event: { value: ConnectedPayload }) => {
                                            return event.value.chathistory
                                        },                                             
                                        usernames: (ctx, event: { value: ConnectedPayload }) => { 
                                            return event.value.usernames
                                        },
                                    }),
                                    (ctx: LobbyContext, event) => {
                                        updateUiChatMessage(ctx.chathistory),
                                        updateUiUsersInRoom(ctx.usernames),
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
                                        chathistory: (ctx, event: { value: ConnectedPayload }) => {
                                            return event.value.chathistory
                                        },                                             
                                        usernames: (ctx, event: { value: ConnectedPayload }) => { 
                                            return event.value.usernames
                                        },
                                    }),
                                    (ctx: LobbyContext, event) => {
                                        updateUiChatMessage(ctx.chathistory),
                                        updateUiUsersInRoom(ctx.usernames),
                                        updateUiHandleAutoinstructions(event.value.showinstructionsglobally)
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
