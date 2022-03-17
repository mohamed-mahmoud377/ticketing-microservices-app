import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats/nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {TicketUpdatedEvent} from "@mohamed-ticketing/common";
import {Message} from "node-nats-streaming";

const setup = async ()=>{
    //create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create and save a ticket
    const ticket = Ticket.build({ // this the ticket that should be build in the ticket srv and then we have it
        // in our order database too
        id: new mongoose.Types.ObjectId().toHexString(), price: 20, title: 'concert'
    })
    await ticket.save();

    //create a fake data object
    const data :TicketUpdatedEvent['data']={
        // this event is coming from the ticket srv with the updated ticket and with its newer version
        id:ticket.id,
        version:ticket.version+1,
        title:'new concert',
        price:99,
        userId:'sdf'
    }

    //create a fake msg object
    //@ts-ignore
    const msg: Message={
        ack:jest.fn()
    }
    //return all of this stuff
    return {msg,data,ticket,listener};
}

it('should ,finds ,updates ,and saves a ticket', async function () {
    const {msg ,data ,ticket,listener}= await setup();
    // we call this function from listen in the production and listen gave us the data and msg from the publish class
    await listener.onMessage(data,msg); // on message here where the data or the ticket is actually updated
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it('should asks the message', async function () {
    const {msg ,data,listener} = await setup();
    await  listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('should do not call ack if the event has a skipped version number ', async function () {
    const {msg,data,listener,ticket}= await setup();
    data.version= 10;
    try{
        await listener.onMessage(data,msg)

    }catch (e) {

    }

    expect(msg.ack).not.toHaveBeenCalled();

});