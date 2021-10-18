import { Machine } from 'xstate'

export const fetchMachine = Machine({
    id: 'fetch',
    initial: 'idle',
    states: {
        idle: {
            on: { FETCH: 'loading' }
        },
        loading: {
            after: {
                3000: 'failure.timeout'
            },
            on: {
                RESOLVE: 'success',
                REJECT: 'failure',
                TIMEOUT: 'failure.timeout' // manual timeout
            },
            meta: {
                message: 'Loading...'
            }
        },
        success: {
            meta: {
                message: 'The request succeeded!'
            }
        },
        failure: {
            initial: 'rejection',
            states: {
                rejection: {
                    meta: {
                        message: 'The request failed.'
                    }
                },
                timeout: {
                    meta: {
                        message: 'The request timed out.'
                    }
                }
            },
            meta: {
                alert: 'Uh oh.'
            }
        }
    }
});
