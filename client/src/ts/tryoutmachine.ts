import { Machine, assign, createMachine } from 'xstate';

interface VideoChatStateSchema {
    states: {
      audio: {
        states: {
          enabled: {};
          disabled: {};
        };
      };
      video: {
        states: {
          enabled: {};
          disabled: {};
        };
      };
    };
  }

type VideoChatEvent =
| { type: 'ENABLE_AUDIO'}
| { type: 'DISABLE_AUDIO'}
| { type: 'ENABLE_VIDEO'}
| { type: 'DISABLE_VIDEO'};


const videoChatMachine = createMachine<any, VideoChatEvent>({
// const videoChatMachine = Machine<any, VideoChatStateSchema, VideoChatEvent>({
  id: 'videoChat',
  type: 'parallel',
  states: {
    audio: {
      initial: 'disabled',
      states: {
        disabled: {
          on: {
            ENABLE_AUDIO: 'enabled'
          }
        },
        enabled: {
          on: {
            DISABLE_AUDIO: 'disabled'
          }
        },
      }
    },
    video: {
      initial: 'disabled',
      states: {
        disabled: {
          on: {
            ENABLE_VIDEO: 'enabled'
          }
        },
        enabled: {
          on: {
            DISABLE_VIDEO: 'disabled'
          }
        },
      }
    },
  }
});