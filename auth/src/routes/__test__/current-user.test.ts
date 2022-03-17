import {app} from "../../app";
import request from "supertest";

it('should respond with details about the current user', async function () {
    const cookie = await global.signin(); // just to avoid importing it everytime
    const response = await  request(app)
        .get('/api/users/currentuser')
        .set('Cookie',cookie)
        .send()
        .expect(200)
    expect(response.body.currentUser.email).toEqual('test@test.com')
});

it('should respond with null if not authenticated ', async function () {
    const response = await  request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200)
    expect(response.body.currentUser).toEqual(null)
});