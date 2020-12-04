import IdGenerator from './IdGenerator';

export type Handler = (...args: any[]) => Promise<unknown> | unknown | undefined;

export interface Handlers {
    [member: string]: Handler;
}

interface Callbacks {
    [id: number]: (value: unknown) => void;
}

export function getInterface(name: string, identifier: string = GetCurrentResourceName()) {
    const ids = new IdGenerator();
    const callbacks: Callbacks = {};

    on(`${name}:${identifier}:proxy_res`, (id: number, payloads: unknown[]) => {
        const callback = callbacks[id];
        if (callback) {
            delete callbacks[id];
            ids.free(id);

            callback(payloads.length <= 1 ? payloads[0] : payloads);
        }
    });

    function generateHandler(memberName: string): Handler {
        return (...args) => {
            if (memberName.startsWith('_')) {
                emit(`${name}:proxy`, memberName.substring(2), args, identifier, -1);
                return undefined;
            }

            let responseReady = false;
            let response: unknown;

            const promise = new Promise<unknown>(resolve => {
                const id = ids.gen();
                callbacks[id] = value => {
                    responseReady = true;
                    response = value;

                    resolve(response);
                };

                emit(`${name}:proxy`, memberName, args, identifier, id);
            });

            return responseReady ? response : promise;
        };
    }

    return new Proxy<Handlers>(
        {},
        {
            get(target, member) {
                const memberName = member.toString();
                if (!target[memberName]) {
                    target[memberName] = generateHandler(memberName);
                }

                return target[memberName];
            },

            set() {
                throw new Error('cannot set values on proxy access interface');
            },
        }
    );
}

export function addInterface(name: string, handlers: Handlers) {
    on(`${name}:proxy`, async (member: string, args: any[], identifier: string, id: number) => {
        const handler = handlers[member];
        let payload: unknown;

        if (handler) {
            try {
                payload = await handler(...args);
            } catch (err) {
                console.error(err);
            }
        } else {
            console.log(`error: proxy call ${name}:${member} not found`);
        }

        if (id >= 0) {
            emit(`${name}:${identifier}:proxy_res`, id, [payload]);
        }
    });
}
