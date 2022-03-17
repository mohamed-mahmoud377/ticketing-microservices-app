import request from "supertest";
import {app} from "../../app";
import * as assert from "assert";

it('should fail when a email that does no exist is supplied', async function () {
    await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(400);
});

it('should fail when an incorrect password is supplied', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);
    await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'wrongPassword'
        })
        .expect(400);
});

it('should respond with a cookie when given a valid credentials ', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);
    const response =await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(200);
    expect(response.get("Set-Cookie")).toBeDefined();


}); 