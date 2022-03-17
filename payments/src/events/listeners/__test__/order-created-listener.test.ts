import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats/nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@mohamed-ticketing/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Order} from "../../../models/order";

const setup = async  ()=>{
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data:OrderCreatedEvent["data"]= {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: "sdfsdf",
        expiresAt: "sdfdsf",
        ticket: {
            id: "sdfsdf,",
            price: 10
        }
    }

    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }

    return {listener,data,msg};

}

it('should replicate the order info ',async function () {
    const {listener,data,msg}= await setup();
    await listener.onMessage(data,msg);
    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);

});

it('should ack the message',async function () {
    const {listener,data,msg}= await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack);
});