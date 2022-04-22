// @ts-nocheck
export type Handler = (...args: any[]) => Promise<unknown> | unknown;

export interface Handlers {
    [member: string]: Handler;
}

function unpackinfo(infot:string){
    return infot
}

export function getInterface(name: string) {
    let Proxyrdata = {};
    function proxy_callback(rvalues: any) {
        Proxyrdata = rvalues;
    }
    function generateHandler(memberName: string): Handler {
        return (...args: any[]) => {
            emit(`${name}:proxy`, memberName, args, proxy_callback);
            return unpackinfo(...Proxyrdata);
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
    on(`${name}:proxy`, async (member: string, args: any[], callback: any) => {
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
        callback(payload);
    });
}
