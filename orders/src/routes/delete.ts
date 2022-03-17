import express, {Response, Request, NextFunction} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@mohamed-ticketing/common";
import {Order} from "../models/order";
import {OrderStatus} from "@mohamed-ticketing/common";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats/nats-wrapper";

const router = express.Router();

router.delete('/:orderId',requireAuth,async  (req:Request,res:Response,next:NextFunction)=>{
    const {orderId} = req.params;
    const order = await Order.findById(orderId).populate('ticket');
    if (!order){
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({id: order.id, version:order.version,ticket: {id:order.ticket.id}})

    res.send(order);


})


export {router as deleteOrderRouter}