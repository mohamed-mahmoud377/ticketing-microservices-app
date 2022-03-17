import express, {Response, Request, NextFunction} from "express";

import {Ticket} from "../models/ticket";
import mongoose from "mongoose";
import {NotFoundError,BadRequestError} from "@mohamed-ticketing/common";

const router = express.Router();

router.get('/tickets/:id', async (req:Request,res:Response,next:NextFunction)=>{

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket){
        throw new NotFoundError();
    }
    
    res.send(ticket)
})


export {router as showTicketRouter}