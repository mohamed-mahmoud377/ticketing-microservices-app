import request from "supertest";
import {app}from '../../app'
import mongoose from "mongoose";

it('should returns a 404 if the ticket is not found', async function () {
    const id= new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404)
});

it('should returns the ticket if the tickets is found', async function () {
    const title= "testTitle";
    const price = 20 // note that here we are testing the creation of the ticket two or using it
    // while you could have used the model itself
    // stephen likes this more because it kind of simulate realty
    // but if there was something wrong with the creation of the ticket that would be not good at all
     const response = await request(app).post('/api/tickets').set("Cookie",global.getAJWTCookie())
         .send({title,price}).expect(201);

    const ticketResponse = await  request(app).get(`/api/tickets/${response.body.id}`).send()
        .expect(200) // that you got the ticket successfully

    expect(ticketResponse.body.title).toEqual(title)
    expect(ticketResponse.body.price).toEqual(price)

});