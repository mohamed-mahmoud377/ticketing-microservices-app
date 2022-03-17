import request from "supertest";
import {Ticket} from "../../models/ticket"
import {app} from "../../app";
import {natsWrapper} from "../../nats/nats-wrapper";


it('should has a route handler listening to /api/tickets for post requests', async function () {
    const response = await request(app).post('/api/tickets').send({})

   expect(response.status).not.toEqual(404);
});

it('should only be accessed if the user is singed in', async function () {
    await request(app).post("/api/tickets").send({}).expect(401);

});
it('should return a status other than 401 if the user is singed in', async  ()=> {
    // here we are testing to see that we are not getting 401 when we are authenticated but to get the cookie you have to log in
    // but to log you have to go to the auth service and we do not want that so we make our own cookie
    // console.log(global.getAJWTCookie());
    const response = await request(app).post('/api/tickets').set('Cookie',global.getAJWTCookie()).send({})

    expect(response.status).not.toEqual(401);
});

it('should returns an error if invalid title is provided', async function () {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.getAJWTCookie())
        .send({title:"",price:13}).expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.getAJWTCookie())
        .send({price:13}).expect(400);
});
it('should returns an error if an invalid price is provided',async function () {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.getAJWTCookie())
        .send({title:"test title",price:-32}).expect(400);


});
it('should create a ticket with valid inputs ', async function () {
    let  tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0); // first we check that the database is empty which what we have done in setup.ts

    await request(app).post("/api/tickets").set("Cookie",global.getAJWTCookie()).send({
        title:"testTitle",  // adding a new ticket with valid input
        price:40,
    }).expect(201);

    tickets = await Ticket.find({}); // checking if we have a record in the database now
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(40)
    expect(tickets[0].title).toEqual("testTitle");


});

it('should publishes an event', async function () {


    await request(app).post("/api/tickets").set("Cookie",global.getAJWTCookie()).send({
        title:"testTitle",  // adding a new ticket with valid input
        price:40,
    }).expect(201);
    // console.log(natsWrapper);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});