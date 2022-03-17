
import {app} from "../../app";
import request from 'supertest'
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket=async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    });
    await ticket.save();
    return ticket;
}

it('should fetch orders for particular user', async function () {
    //create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const userOne = global.getAJWTCookie();  // this cookie has the user id inside it
    const userTwo = global.getAJWTCookie();

    // create one order as user #1
    await request(app)
        .post('/api/orders')
        .set('Cookie',userOne)
        .send({ticketId:ticketOne})
        .expect(201)

    //create two orders as user #2
   const {body:orderOne}= await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticketTwo})
        .expect(201)
    const {body:orderTwo}= await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticketThree})
        .expect(201)

    //make request to get orders for user #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie',userTwo)
        .send({})
        .expect(200)

    // to make sure we only got teh order for user 2

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);

});