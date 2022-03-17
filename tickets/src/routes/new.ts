import express, {Response, Request, NextFunction} from "express";
import {requireAuth, validateRequest} from "@mohamed-ticketing/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats/nats-wrapper";

const router = express.Router();

router.post('/tickets',requireAuth,[
    body(["title","price"]).not().isEmpty().withMessage('Title and price are required'),
    body('price').isFloat({gt:0})
],validateRequest,async (req:Request,res:Response,next:NextFunction)=>{

   const {title,price} = req.body;
   const ticket = Ticket.build({
       title,price,userId:req.currentUser!.id
   })
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
       id: ticket.id,
       title:ticket.title,
       price:ticket.price,
       userId:ticket.userId,
        version:ticket.version
   })

   res.status(201).send(ticket);
})

export {router as createTicketRouter};