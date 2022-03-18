import express from 'express'
import "express-async-errors";// look we were always used to call next() with the error function to handle error because of async functions
// you can't just throw an error and get out of an async function but with the help of this package to can easily just throw an error
// and it will work and have to call after importing express

import bodyParser from 'body-parser'


import {currentUser, errorHandler, NotFoundError} from "@mohamed-ticketing/common";
import cookieSession from "cookie-session";
import {createChargeRouter} from "./routes/new";

const app = express();
app.set('trust proxy',true); // to make sure that you trust nginx ingress proxy
// app.enable('trust proxy') does that same thing
app.use(bodyParser.json());
app.use(cookieSession({
    //jerry
    signed: false,
    secure:false

    // secure: process.env.NODE_ENV !=='test' // note that you will be in the test env while using jest
    // this what jest put in your env but not that jest does not send https request or may I say supertest because it is the
    // lib the sends the http request so when we are in test env the connection will not be secure so the jwt cookie will not
    // be sent so it will any test that checks that so we have to it to false while when we are in the test env as above
}))
app.use(currentUser);


app.use(createChargeRouter)

app.all('*',async ()=>{
    throw new NotFoundError();
})
app.use(errorHandler)


export {app}