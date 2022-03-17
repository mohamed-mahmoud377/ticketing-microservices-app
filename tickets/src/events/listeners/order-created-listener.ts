import {Listener, OrderCreatedEvent, Subjects} from "@mohamed-ticketing/common";
import {queueGroupName} from './queue-group-name'
import {Message} from'node-nats-streaming'
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";
export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        //if not ticket , throw error
        if (!ticket){
            throw new Error('Ticket not found');
        }

        //mark the ticket as being reserved by setting its orderID prop
        ticket.set({orderId:data.id})

        //save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
        orderId:data.id, id:ticket.id, price: ticket.price, title: ticket.title, userId:ticket.userId, version: ticket.version

        })

        // ack the message
        msg.ack();
    }

    queueGroupName: string= queueGroupName;
    subject: OrderCreatedEvent["subject"]= Subjects.OrderCreated;

}