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
    updateUisetInstructionText
} from './updateUI';

export interface ChatPayload {
    'time': string,
    'username': string,
    'msg': string,
}

interface ConnectedPayload {
    'username': string
    'chathistory': ChatPayload[],
    'isadmin': boolean,
    'usernames': string[]
}

interface ConnectedPayloadWithMsg extends Omit<ConnectedPayload, 'username'>{
    userJoinedMsg: string
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
    | { type: 'connection-established', value: ConnectedPayloadWithMsg } // TODO define data type sth like dictionary chathistory, name time
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

    const lobbyMachine = createMachine<LobbyContext, LobbyEvent>({ // LobbySchema,
        id: 'lobby',
        context: initialContext,
        initial: 'startscreen',
        states: {
            // start screen state
            startscreen: {
                entry: [
                    (ctx, _) => {
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
                invoke: {
                    id: 'connecter',
                    src: (ctx, event) => {
                        const socket = io('http://127.0.0.1:5000/');
    
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
                        actions: assign({ io: (ctx, event) => event.data })
                    }
                    // onError: {
                    //     target: 'errorscreen',
                    //     // actions: assign({ error: (context, event) => event.data })
                    // }             
                },
                exit: [
                    (ctx, event) => {
                        ctx.io.emit('join', {
                            userid: ctx.io.id,
                            username: ctx.username,
                        });
                    }
                ],
            },
    
            connected:{
                invoke: {
                    id: 'connecter',
                    src: (ctx, event) => (callback, onReceive) => {
                        ctx.io.on('user-connected', (arg: ConnectedPayload) => {
                            
                            console.log('user connected!!!', arg)
                            console.log('previous chathistory', arg['chathistory'])
                            console.log('username', arg['username'])
                        
                            const userJoinedMsg = arg['username'] + ' has entered the room.'
    
                            const value: ConnectedPayloadWithMsg = {                            
                                userJoinedMsg,
                                chathistory: arg['chathistory'],
                                isadmin: arg['isadmin'],
                                usernames: arg['usernames']
                            }
    
                            callback({ type: 'connection-established', value: value })
                        })
                    }
                },
                on: {
                    'connection-established': {
                        target: 'room',                    
                        actions: [
                            assign({
                                chathistory: (ctx, event) => { 
                                    return event.value.chathistory
                                },
                                usernames: (ctx, event) => { 
                                    return event.value.usernames
                                },
                                isadmin: (ctx, event) => { 
                                    return event.value.isadmin
                                }
                            }),
                            () => {
                                console.log('THIS IS ONLY LOGGED WHEN THE CURRENT USER JOIN');
                                console.log('BUT NOT WHEN OTHERS JOIN, WHICH IS BAD');
                            },
                            (ctx, event) => {
                                updateUisetInstructionText(event.value.isadmin, ctx.username)
                            }
                        ]
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
            //     always: [
            //         { 
            //             target: '#lobby.room.waiting-for-players',
            //             cond: () => true,
            //             actions: () => {
            //                 alert('DA PASSIEEERT WAS!!')
            //             }
            //         }
            //     ],
            //     states:{
            //         initial: 'room.waiting-for-players',
            //         'waiting-for-players': {
            //             actions: () => {
            //                 alert('DA PASSIEEERT WAS!! 2222')
            //             }
            //             // cond: (ctx) => ctx.msg != null && ctx.msg !== '',
            //         },
            //         'ready-to-play':{
            //             actions: () => {
            //                 alert('DA PASSIEEERT WAS!! 3333')
            //             }
            //         }
            //     },
                entry: [
                    (ctx, _) => updateUiShowRoom(),
                    (ctx, _) => {
                        console.log('CONTEXT chathistory', ctx.chathistory)
                        updateUiChatMessage(ctx.chathistory),
                        updateUiUsersInRoom(ctx.usernames)
                    }                     
                ],
                invoke: {
                    id: 'msghandler',
                    src: (ctx, event) => (callback, onReceive) => {
    
                        ctx.io.on('broadcast-message', function(args: ChatPayload){
                            // const time: string = args['time']
                            // const username: string = args['username']
                            // const msg: string = args['msg']
                            // const messagePair = [time, username, msg]
    
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
                    back: 'startscreen',
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
                    }
                },
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
