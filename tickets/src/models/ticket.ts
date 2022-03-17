import * as mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface TicketAttrs{ // this for when you want to make the ticket to add a type check
    title:string;
    price : number;
    userId: string;
}



interface TicketDoc extends mongoose.Document{ // this is the whole doc when mongoose adds its prop to it or you can add still not very clear though

    title:string;
    price: number;
    userId: string;
    version:number; //because we changed it from __v to version which is not in mongoose.Document
    // so to be able to access it you have to add it
    orderId?:string;
}

interface TicketModel extends mongoose.Model<TicketDoc>{ // overriding or adding method to the model class
    build(attrs:TicketAttrs):TicketDoc; // here we are adding the ticketAttr in the input but note that we got doc in the output
}

const ticketSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    price:{
        type: Number,
        required:true
    },
    userId:{
        type: String,
        required:true
    },
    orderId:{
        type:String, // it is not required because it will be added when the ticket first created
    }
},{
    toJSON:{
        transform(doc,ret){
            ret.id= ret._id;
            delete ret._id;
        }
    }
});
ticketSchema.set('versionKey','version'); // to change __V to version

ticketSchema.plugin(updateIfCurrentPlugin); // this increment the version prop for us and make sure that we do not save any doc with the
// the wrong version


ticketSchema.statics.build=(attrs:TicketAttrs)=>{
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket',ticketSchema);

export {Ticket};