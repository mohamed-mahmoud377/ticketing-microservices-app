import {Listener, OrderCancelledEvent, OrderStatus, Subjects} from "@mohamed-ticketing/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{

    queueGroupName: string= queueGroupName;
    subject: OrderCancelledEvent["subject"]=Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const order = await Order.findOne({  //note that we can do it a function inside of the order model like the ticket model
            // bs faks
            _id:data.id,
            version:data.version-1
        })

        if (!order){
            throw new Error('Order not found');
        }

        order.set({status:OrderStatus.Cancelled});

        await order.save();

        msg.ack();

    }


}