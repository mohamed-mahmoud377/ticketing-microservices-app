import{MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import {app} from "../app";
import jwt from 'jsonwebtoken'
jest.setTimeout(10000)
declare global{ // just doing this to avoid importing it everytime
    var getAJWTCookie: ()=> string[]
}

jest.mock('../nats/nats-wrapper') // to make use of the mock file
let mongo: MongoMemoryServer;
beforeAll(async ()=>{
    // so we are connecting to the in memory database from mongo
    process.env.JWT_KEY= 'a very secure key haahah aha ah ' // note that it is only added inside of the pad but this is a local tet

      mongo = await MongoMemoryServer.create();
    const mongoUri =  mongo.getUri();
    await mongoose.connect(mongoUri)
})

beforeEach(async ()=>{
    // deletes all the collection in the database before every test
    jest.clearAllMocks(); //because we are testing the publish mock function and we need to see if it was called of not
    // for every test so you have to clear mock for every test and that what we do
    const collections = await mongoose.connection.db.collections();
    const asyncCollections =collections.map(async val => val.deleteMany({}) )
    await Promise.all(asyncCollections);
})


afterAll(async ()=>{ // after running all tests just
    // stop mongo and close the connection
    await mongo.stop();
    await mongoose.connection.close();
})


global.getAJWTCookie =  ()=>{
   //build a JWT payload. {id , email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),  // here we are building a cookie for a random user means that every time you call the function
        // you get different cookie and different user
        email:'test@test.com'

    }

    //create the JWT!
    const token =  jwt.sign(payload,process.env.JWT_KEY!);

    // Build the session Object.
    const session = {jwt: token};

    //turn that session into JSON
    const sessionJSON = JSON.stringify((session));

    //Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return a string that the cookie with encoded data

    return [`session=${base64}`] // to make super test happy ! you made to array when it clearly does not have to be !

}