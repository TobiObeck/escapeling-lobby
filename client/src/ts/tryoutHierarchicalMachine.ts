/*

import { Machine, assign, createMachine } from 'xstate';

interface TempSchema {

}

interface TryoutHierarchicalSchema {
    states: {
        green: {};
        yellow: {};
        red: {
            states: {
                walk: {};
                wait: {};
                stop: {};
                blinking: {};
            };
        };
    }
}

// The events that the machine handles
type TryoutHierarchicalEvent =
    { type: 'TIMER' }
    | { type: 'POWER_OUTAGE' }
    | { type: 'POWER_RESTORED' }
    | { type: 'PED_COUNTDOWN' }


// The context (extended state) of the machine
interface TryoutHierarchicalContext {
    username: string,
}


const pedestrianStates = {
    initial: 'walk',
    states: {
      walk: {
        on: {
          PED_COUNTDOWN: { target: 'wait' }
        }
      },
      wait: {
        on: {
          PED_COUNTDOWN: { target: 'stop' }
        }
      },
      stop: {},
      blinking: {}
    }
  };
  
//   const lightMachine = createMachine({
// const lightMachine = createMachine<any, TryoutHierarchicalEvent>({
const lightMachine = Machine<TryoutHierarchicalContext, TryoutHierarchicalSchema, TryoutHierarchicalEvent>({
    key: 'light',
    initial: 'green',
    states: {
        green: {
            on: {
                TIMER: { target: 'yellow' }
            }
        },
        yellow: {
            on: {
                TIMER: { target: 'red' }
            }
        },
        //   red: {
        //     on: {
        //       TIMER: { target: 'green' }
        //     },
        //     ...pedestrianStates
        //   }
        // },
        red: {
            states: {
                walk: {
                    on: {
                        PED_COUNTDOWN: { target: 'wait' }
                    }
                },
                wait: {
                    on: {
                        PED_COUNTDOWN: { target: 'stop' }
                    }
                },
                stop: {},
                blinking: {}
            }
        },
        on: {
            POWER_RESTORED: '.red'
            // POWER_RESTORED: { target: '.red' },
            // POWER_OUTAGE: {
            //     target: '.red.blinking' 
            //     // target: 'red',
            // },
        }
    }
});

*/