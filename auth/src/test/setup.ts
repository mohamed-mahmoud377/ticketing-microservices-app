import{MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import {app} from "../app";

declare global{ // just doing this to avoid importing it everytime
    var signin: ()=> Promise<string[]>
}
let mongo: MongoMemoryServer;
beforeAll(async ()=>{ // this function runs before any code runs for any test
    // so we are connecting to the in memory database from mongo
    process.env.JWT_KEY= 'a very secure key' // note that it is only added inside of the pad but this is a local tet

      mongo = await MongoMemoryServer.create();
    const mongoUri =  mongo.getUri();
    await mongoose.connect(mongoUri)
})

beforeEach(async ()=>{ // this function runs before every test
    // deletes all the collection in the database before every test
    const collections = await mongoose.connection.db.collections();
    const asyncCollections =collections.map(async val => val.deleteMany({}) )
    await Promise.all(asyncCollections);
})


afterAll(async ()=>{ // after running all tests just
    // stop mongo and close the connection
    await mongo.stop();
    await mongoose.connection.close();
})


global.signin = async ()=>{
    const email = "test@test.com";
    const password= "test1234";
    const response= await request(app)
        .post('/api/users/signup')
        .send({
            email:email,
            password:password
        })
        .expect(201);
    return  response.get('Set-Cookie');
}