import IdGenerator from './IdGenerator';

export type CallHandler = (...args: any[]) => Promise<unknown> | void;

export interface CallHandlers {
    [member: string]: CallHandler;
}

export type BindHandler = (...args: any[]) => Promise<unknown> | unknown;

export interface BindHandlers {
    [member: string]: BindHandler;
}

interface Callbacks {
    [id: number]: (value: unknown) => void;
}

export function getInterface(name: string, identifier: string = GetCurrentResourceName()) {
    const ids = new IdGenerator();
    const callbacks: Callbacks = {};

    onNet(`${name}:${identifier}:tunnel_res`, (id: number, payloads: unknown[]) => {
        const callback = callbacks[id];
        if (callback) {
            delete callbacks[id];
            ids.free(id);

            callback(payloads.length <= 1 ? payloads[0] : payloads);
        }
    });

    function generateHandler(memberName: string): CallHandler {
        return (...args) => {
            if (memberName.startsWith('_')) {
                return emitNet(`${name}:tunnel_req`, memberName.substring(1), args, identifier, -1);
            }

            return new Promise(resolve => {
                const id = ids.gen();

                callbacks[id] = resolve;

                emitNet(`${name}:tunnel_req`, memberName, args, identifier, id);
            });
        };
    }

    return new Proxy<CallHandlers>(
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
                throw new Error("set isn't supported on Tunnel access");
            },
        }
    );
}

export function bindInterface(name: string, handlers: BindHandlers) {
    onNet(`${name}:tunnel_req`, async (member: string, args: any[], identifier: string, id: number) => {
        const handler = handlers[member];
        let payload: unknown;

        if (handler) {
            try {
                payload = await handler(...args);
            } catch (err) {
                console.error(err);
            }
        }

        if (id >= 0) {
            emitNet(`${name}:${identifier}:tunnel_res`, id, [payload]);
        }
    });
}
