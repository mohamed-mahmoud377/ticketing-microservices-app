import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {Order} from "./order";
import {OrderStatus} from "@mohamed-ticketing/common";

interface TicketAttrs{
    id?:string
    title: string;
    price: number;

}
export interface TicketDoc extends mongoose.Document{
    version:number;
    title:string;
    price:string;
    isReserved():Promise<boolean>;
}
interface TicketModel extends  mongoose.Model<TicketDoc>{
    build(attrs:TicketAttrs):TicketDoc;
    findByEvent(event:{id:string,version:number}):Promise<TicketDoc |null>;
}

const ticketSchema = new mongoose.Schema({
  title:{
      type:String,
      required:true
  } ,
    price:{
      type:Number,
        required:true,
        min:0
    }

},{
    toJSON:{
        transform(doc,ret){ // short for return
            ret.id = ret._id;
            // delete ret._id;

        }
    }
})

ticketSchema.set('versionKey','version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs:TicketAttrs)=>{
    return new Ticket({
        _id:attrs.id, // because it has t o _id to actually change the ID
        title:attrs.title,
        price:attrs.price
    });
}

ticketSchema.statics.findByEvent = (event:{id:string,version:number})=>{
    return Ticket.findOne({
        _id:event.id,
        version:event.version-1
    })
}
// Make sure that the ticket is not already reserved
//run query to look at all orders, Find an order where the ticket
//is the ticket we just found *and* the order status is *not* cancelled.
// if wer find an order from tht means the ticket is reserved
ticketSchema.methods.isReserved =async function () {
    const existingOrder = await Order.findOne({
        ticket:this,
        status:{
            $in:[
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ]
        }
    })

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc,TicketModel>("Ticket",ticketSchema);

export  { Ticket}