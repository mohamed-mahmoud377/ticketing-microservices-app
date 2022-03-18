import request from "supertest";
import {app} from "../../app";

import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@mohamed-ticketing/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

const URI = '/api/payments';

jest.mock('../../stripe');

it('should return a 404 when purchasing an order t hat does not exist ', async function () {
    await request(app)
        .post(URI)
        .set("Cookie",global.getAJWTCookie())
        .send({
            token:'sdfsdf',
            orderId:new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('should return a 401 when purchasing an order that does not belong to the user',async function () {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId:new mongoose.Types.ObjectId().toHexString(),
        version:0,
        price:20,
        status:OrderStatus.Created
    })

    await order.save();

    await request(app)
        .post(URI)
        .set("Cookie",global.getAJWTCookie())
        .send({
            token:'sdfsdf',
            orderId:order.id,
        })
        .expect(401);
});

it('should return a 400 when purchasing a cancelled order ', async function () {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version:0,
        price:20,
        status:OrderStatus.Cancelled
    })

    await order.save();


    await request(app)
        .post(URI)
        .set("Cookie",global.getAJWTCookie(userId))
        .send({
            token:'sdfsdf',
            orderId:order.id,
        })
        .expect(400);
});

// it('should return a 201 with a valid inputs', async function () {
//     const userId = new mongoose.Types.ObjectId().toHexString();
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId,
//         version:0,
//         price:20,
//         status:OrderStatus.Created
//     })
//
//     await order.save();
//
//
//     await request(app)
//         .post(URI)
//         .set("Cookie",global.getAJWTCookie(userId))
//         .send({
//             token:'tok_visa',
//             orderId:order.id,
//         })
//         .expect(201)
//
//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//     expect(chargeOptions.source).toEqual('tok_visa');
//     expect(chargeOptions.amount).toEqual(order.price*100);
//     expect(chargeOptions.currency).toEqual('usd')
//
//     const payment = await Payment.findOne({
//         orderId:order.id
//     })
//
//     expect(payment).not.toBeNull();
//
//
// });