import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {response} from "express";
import {Order} from "../../models/order";
import {OrderStatus} from "@mohamed-ticketing/common";
import {natsWrapper} from "../../nats/nats-wrapper";
import mongoose from "mongoose";


it('should marks an order as cancelled ', async function () {
    //create a ticket wit Ticket Model
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    })
    await ticket.save();
    const userCookie = global.getAJWTCookie();
    //make a request to create an order
    const {body:order}=await request(app)
        .post('/api/orders')
        .set('Cookie',userCookie)
        .send({ticketId:ticket.id})
        .expect(201);
    //make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',userCookie)
        .send()
        .expect(200);


    //expectation to make sure the thing is cancelled

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('should emit an order cancelled event  ', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    })
    await ticket.save();
    const userCookie = global.getAJWTCookie();
    //make a request to create an order
    const {body:order}=await request(app)
        .post('/api/orders')
        .set('Cookie',userCookie)
        .send({ticketId:ticket.id})
        .expect(201);
    //make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',userCookie)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});