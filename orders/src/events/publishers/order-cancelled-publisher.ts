import {OrderCancelledEvent, Publisher, Subjects} from "@mohamed-ticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: OrderCancelledEvent["subject"]=Subjects.OrderCancelled;

}