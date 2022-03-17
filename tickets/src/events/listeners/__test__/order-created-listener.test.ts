import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats/nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCreatedEvent, OrderStatus} from "@mohamed-ticketing/common";
import Mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async ()=>{
    //Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    //create and save a ticket
    const ticket = Ticket.build({
        price: 99, title: "testTicket", userId: "testId"
    })

    await ticket.save();

    //create the fate data event
    const data:OrderCreatedEvent['data']= {
        id: new Mongoose.Types.ObjectId().toHexString() ,
        version: 0,
        status:OrderStatus.Created,
        userId: "testId",
        expiresAt: "test",
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // create the msg object
    // @ts-ignore
    const msg:Message={
        ack:jest.fn()
    }
    return {listener, ticket, data, msg};

    }




it('should sets the orderId of the ticket  ', async function () {
    const {data, listener, msg, ticket} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id); // makes sure that the ticket.orderId prop get updated ofter calling
    //on Message





});



it('should ack the message', async function () {
 const {data, listener, msg, ticket} = await setup();
 await listener.onMessage(data,msg);

 expect(msg.ack).toHaveBeenCalled();
});


it('should publish a ticket updated event ', async function () {
    const {data, listener, msg, ticket} = await setup();

    await listener.onMessage(data,msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // @ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls)         // important


    // here the publish function is a mock function from jest know
    // to let ts know that is is a jest mock we do this
    // but to can also ignore that errors
    //why are we doing this ? to access the param provided to the function to make sure that is valid
    // why [0][1] console log and you will get it
    const ticketUpdatedData=JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);


});
