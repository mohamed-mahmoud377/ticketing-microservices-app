import request from "supertest";
import {app} from "../../app";


it('should returns a 201 on successful signup ', async  ()=> {
    return request(app)
        .post('/api/users/signup')
        .send({
            email:"test@test.com",
            password:'password'
        })
        .expect(201);
});

it('should return a 400 with an invalid email ', async function () {
    return request(app).post('/api/users/signup')
        .send({
            email:'safasfd',
            password:'password'
        })
        .expect(400);
});

it('should returns a 400 wiht missing email and password', async function () {
    await request(app) //                   you can return or await the request
        .post('/api/users/signup')
        .send({
            email:'test@test.com'
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            password:'assdfsdfdf'
        })
        .expect(400);
});

it('should disallows duplicate emails ', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(400)
});

it('should sets a cookie after successful signup ', async function () { // read this
    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email:'test@test.com',
            password:"test1234"
        })
        .expect(201) //first test

    expect(response.get('Set-Cookie')).toBeDefined(); // this a jest stuff
});