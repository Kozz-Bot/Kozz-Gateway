import { ContactPayload, MessageReceivedByGateway } from '..';
export type Command = {
    module?: string;
    method: string;
    immediateArg: string | null;
    namedArgs: Record<string, string | number | boolean> | null;
    message: MessageReceivedByGateway;
    boundaryId: string;
    boundaryName: string;
    query: string;
    taggedContacts: ContactPayload[];
};
