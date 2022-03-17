import {TicketCreatedListener} from "../ticket-created-listener";
import {TicketCreatedEvent} from "@mohamed-ticketing/common";
import {natsWrapper} from "../../../nats/nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup =async ()=>{
    //create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    //create a fake date event
    const data:TicketCreatedEvent['data']={
        version:0,
        id:new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:10,
        userId:new mongoose.Types.ObjectId().toHexString(),
    }
    //create a fake message object
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }
    return {listener,data,msg};
}

it('should create and saves a ticket', async function () {

    const {listener, data,msg}= await setup();
    //call the onMessage function with the date object + message object
    await listener.onMessage(data,msg);  // note that here we are calling the message function directly but in the real call
    // we call listen which listens for the real data and then pass it to the onMessage then the onMessage saves the ticket to the database

    //write assertions to make sure ticket was created !
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('should ack the message', async function () {
    const {data, listener,msg}= await setup();

    //call the onMessage function with the date object + message object
    await listener.onMessage(data,msg);

    //write assertions to mak sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});