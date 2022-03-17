import {Listener, OrderCancelledEvent, Subjects} from "@mohamed-ticketing/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {TicketCreatedPublisher} from "../publishers/ticket-created-publisher";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new Error('Ticket not found');
        }

        ticket.set({orderId:undefined});
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            orderId: ticket.orderId,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version
        })

        msg.ack();


    }



    queueGroupName: string=queueGroupName;
    subject: OrderCancelledEvent["subject"]=Subjects.OrderCancelled;

}