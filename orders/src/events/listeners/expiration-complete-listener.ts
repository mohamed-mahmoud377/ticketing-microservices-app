import {ExpirationCompleteEvent, Listener, OrderStatus, Subjects} from "@mohamed-ticketing/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    queueGroupName: string= queueGroupName;
    subject: ExpirationCompleteEvent["subject"]=Subjects.ExpirationComplete;


    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        const order= await Order.findById(data.orderId).populate('ticket');

        if (!order){
            msg.ack();
            throw new Error('Order not found');
        }
        if (order.status===OrderStatus.Complete){
            return msg.ack();
        }


        order.set({
            status:OrderStatus.Cancelled
        })

        await order.save();

       await new OrderCancelledPublisher(this.client).publish({
            id: order.id, ticket: {id: order.ticket.id}, version: order.version

        })


        msg.ack();



    }

}