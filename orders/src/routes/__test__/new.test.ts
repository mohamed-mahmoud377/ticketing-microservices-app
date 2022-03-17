import mongoose from "mongoose";
import {app} from "../../app";
import request from 'supertest'
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@mohamed-ticketing/common";
import {natsWrapper} from "../../nats/nats-wrapper";

it('should returns an error it the ticket does noe exist ', async function () {
    const ticketId=  new mongoose.Types.ObjectId()
    await request(app)
        .post('/api/orders')
        .set('Cookie',global.getAJWTCookie())
        .send({ticketId})
        .expect(404)
});

it('should returns an error if the ticket is already reserved', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),

        title:'concert',
        price: 20
    });
    await ticket.save();
    const order =Order.build({
        ticket,
        userId: 'fakeUserID',
        status:OrderStatus.Created,
        expiresAt: new Date()
});
    await order.save()

    await request(app)
        .post('/api/orders')
        .set("Cookie",global.getAJWTCookie())
        .send({ticketId:ticket.id})
        .expect(400)

});

it('should reserve a ticket ', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),

        title:'concert',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set("Cookie",global.getAJWTCookie())
        .send({ticketId:ticket.id})
        .expect(201)

});

it('should emits an order created event',async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),

        title:'concert',
        price:20
    })
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie',global.getAJWTCookie())
        .send({ticketId:ticket.id})
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});