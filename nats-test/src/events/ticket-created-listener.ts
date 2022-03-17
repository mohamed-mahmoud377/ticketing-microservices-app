import {Listener} from "./listener";
import {Message, Stan} from "node-nats-streaming";
import {TicketCreatedEvent} from "./ticket-created-event";
import {Subjects} from "./subject";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    queueGroupName = 'payments-service'; // note that we can don it the constructor too
    readonly subject=Subjects.TicketCreated;

    constructor(client:Stan) {
        super(client);

    }

    onMessage(data: any, msg: Message): void {
        console.log('event data !' ,data);


        msg.ack();
    }

}
