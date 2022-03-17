import express, {NextFunction, Request, Response} from "express";
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@mohamed-ticketing/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats/nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS= 1 *60;
router.post('/',requireAuth,[
    body('ticketId').not().isEmpty()
        // .custom((input:string)=>{mongoose.Types.ObjectId.isValid(input)}) // this make assumption that we are using mongo in
        // the tickets' database which couple or services in way so that is not right but I'm putting it here anyway
        .withMessage('TicketId must be provided')
],validateRequest,async  (req:Request,res:Response,next:NextFunction)=>{
    const {ticketId}= req.body;
    // find the ticket the user is tyring to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket){
        throw new NotFoundError();
    }

    // Make sure that the ticket is not already reserved
    //run query to look at all orders, Find an order where the ticket
    //is the ticket we just found *and* the order status is *not* cancelled.
    // if wer find an order from tht means the ticket is reserved
    const isReserved = await ticket.isReserved();
    if (isReserved){
        throw new BadRequestError('Ticket is already reserved');
    }

    // calc an expiration date for this order
        const expiration = new Date;
    expiration.setSeconds(expiration.getSeconds()+EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to the database

     const order = Order.build({
         userId:req.currentUser!.id,
         status:OrderStatus.Created,
         expiresAt:expiration,
         ticket
     })

    await order.save();

    //publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id:order.id,
        status:order.status,
        version:order.version,
        userId:order.userId,
        expiresAt:order.expiresAt.toISOString(), // to convert it to the time zone we want in this case is ISO
        ticket: {id: ticket.id, price: Number(ticket.price)},

    })


    res.status(201).send(order);
})


export {router as createOrderRouter}