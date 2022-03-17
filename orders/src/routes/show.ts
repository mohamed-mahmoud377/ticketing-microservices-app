import express, {Response, Request, NextFunction} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@mohamed-ticketing/common";
import {Order} from "../models/order";
const router = express.Router();

router.get('/:orderId',requireAuth,async  (req:Request,res:Response,next:NextFunction)=>{
    const order= await Order.findById(req.params.orderId).populate('ticket');
    if (!order){
        throw new NotFoundError();
    }
    if (order.userId !==req.currentUser!.id){ //making sure that the user is the real user
        throw new NotAuthorizedError();
    }

    res.send(order);
})


export {router as showOrderRouter}