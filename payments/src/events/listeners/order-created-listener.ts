import {Listener, OrderCreatedEvent, Subjects} from "@mohamed-ticketing/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    queueGroupName: string= queueGroupName;
    subject: OrderCreatedEvent["subject"]=Subjects.OrderCreated;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        const order = Order.build({
            id: data.id, price: data.ticket.price, status: data.status, userId: data.userId, version: data.version
        })

        await order.save();

        msg.ack();
    }

}