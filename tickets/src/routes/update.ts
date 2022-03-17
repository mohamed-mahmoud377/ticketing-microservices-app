import express,{Response,Request} from "express";
import {body} from "express-validator";
import {
    validateRequest,
    NotFoundError,
    requireAuth,
    NotAuthorizedError,
    BadRequestError
} from "@mohamed-ticketing/common";
import {Ticket} from "../models/ticket";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsWrapper} from "../nats/nats-wrapper";

const router = express.Router();

router.put('/tickets/:id',requireAuth,[
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price").isFloat({gt:0}).withMessage("price must be above zero")
],validateRequest,async (req:Request,res:Response)=>{
    const ticket = await  Ticket.findById(req.params.id);
    if (!ticket){
        throw new NotFoundError();
    }
    if (ticket.orderId){
        throw new  BadRequestError('Cannot edit a reserved Ticket');
    }

    if (ticket.userId!== req.currentUser!.id){
        throw  new NotAuthorizedError();
    }

    ticket.set({
        title:req.body.title,
        price:req.body.price
    })
    await  ticket.save();
     new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title:ticket.id,
        price: ticket.price,
        userId:ticket.userId,
         version:ticket.version

    })

    res.send(ticket);
})

export {router as updateTicketRouter};