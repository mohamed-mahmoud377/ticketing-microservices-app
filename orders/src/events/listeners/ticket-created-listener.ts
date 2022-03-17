import {Message} from "node-nats-streaming";
import {Listener, Subjects, TicketCreatedEvent} from "@mohamed-ticketing/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";


export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    queueGroupName: string=queueGroupName;
    subject: TicketCreatedEvent["subject"]=Subjects.TicketCreated;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const {id,title,price} = data;
        const ticket = Ticket.build({ // we provide the id so we can
            id,title,price
        })
        await ticket.save();
        msg.ack();
    }
}