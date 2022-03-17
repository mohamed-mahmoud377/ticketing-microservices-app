import mongoose from "mongoose";
import {app} from "../../app";
import request from 'supertest'
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@mohamed-ticketing/common";
import {response} from "express";


it('should fetch the order', async function () {
    //create a ticket
    const ticket= Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),

        title:'concert',
        price:20
    })
    await ticket.save();
    const userCookie = global.getAJWTCookie();
    // make a request to build an order with this ticket
        const {body:order} = await request(app)
            .post('/api/orders')
            .set('Cookie',userCookie)
            .send({ticketId:ticket.id})
            .expect(201);
    // make request to fetch the order
    const {body:fetchedOrder}=await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie',userCookie)
        .send()
        .expect(200)

    expect(fetchedOrder.id).toEqual(order.id);
});


it('should return an error if one user tires to fetch another users order', async function () {
    //create a ticket
    const ticket= Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),

        title:'concert',
        price:20
    })
    await ticket.save();
    const userCookie = global.getAJWTCookie();
    const user2Cookie = global.getAJWTCookie();
    // make a request to build an order with this ticket
    const {body:order} = await request(app)
        .post('/api/orders')
        .set('Cookie',userCookie)
        .send({ticketId:ticket.id})
        .expect(201);
    // make request to fetch the order
   await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie',user2Cookie)
        .send()
        .expect(401)


});