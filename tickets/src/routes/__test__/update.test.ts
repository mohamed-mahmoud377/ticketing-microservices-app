import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats/nats-wrapper";


it('should returns a 404 if the provided id does not exist ', async function () {
    const id = new mongoose.Types.ObjectId().toHexString(); // creating a valid id that does not exist
    await request(app).put(`/api/tickets/${id}`)
        .set("Cookie",global.getAJWTCookie())
        .send({title:"updatedTitle",price:10})
        .expect(404);
});

it('should returns 401 if the user ist not authenticated  ', async function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`)
        .send({title:"updatedTitle"})
        .expect(401);
});

it('should returns a 401 if the user does not own the ticket ', async function () {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const response=await request(app).post("/api/tickets")
        .set("Cookie",global.getAJWTCookie()) // note that we are creating or getting the usr from this cookie which its payload has info
        // or the id and email of the user and also in the function we create random user id everytime
        .send({
            title:'updatedTitle',
            price:10
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)       // now we are trying to update the same ticket but by a different user
        .set("Cookie",global.getAJWTCookie())
        .send({
            title:"updatedTitle2",
            price:10
        }).expect(401);


});

it('should a  400 if the user provides an invalid title or price ', async function () {
    const cookie  = global.getAJWTCookie();
    const response=await request(app).post("/api/tickets")
        .set("Cookie",cookie)
        .send({
            title:'updatedTitle',
            price:10
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)      // note that now we are the same user because we are using the same cookie
        .set("Cookie",cookie)                        //So updating should be valid but with valid input
        .send({
            title:"",
            price:10
        }).expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)      // note that now we are the same user because we are using the same cookie
        .set("Cookie",cookie)                        //So updating should be valid but with valid input
        .send({
            title:"validTitle",
            price:-10
        }).expect(400);





});

it('should update the ticket if provided valid inputs ', async function () {
    const cookie  = global.getAJWTCookie();
    const response=await request(app).post("/api/tickets")
        .set("Cookie",cookie)
        .send({
            title:'updatedTitle',
            price:10
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)      // note that now we are the same user because we are using the same cookie
        .set("Cookie",cookie)                        //So updating should be valid but with valid input as is
        .send({
            title:"jerry is the best ",
            price:10
        }).expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send({})
     // and now we are making sure that the title and the price is updated
    expect(ticketResponse.body.title).toEqual("jerry is the best ");
    expect(ticketResponse.body.price).toEqual(10);

});

it('should publishes an event', async function () {
    const cookie  = global.getAJWTCookie();
    const response=await request(app).post("/api/tickets")
        .set("Cookie",cookie)
        .send({
            title:'updatedTitle',
            price:10
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)      // note that now we are the same user because we are using the same cookie
        .set("Cookie",cookie)                        //So updating should be valid but with valid input as is
        .send({
            title:"jerry is the best ",
            price:10
        }).expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('should reject update if the ticket is reserved', async function () {
    const cookie  = global.getAJWTCookie();
    const response=await request(app).post("/api/tickets")
        .set("Cookie",cookie)
        .send({
            title:'updatedTitle',
            price:10
        });
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)      // note that now we are the same user because we are using the same cookie
        .set("Cookie",cookie)                        //So updating should be valid but with valid input as is
        .send({
            title:"jerry is the best ",
            price:10
        }).expect(400);

});
