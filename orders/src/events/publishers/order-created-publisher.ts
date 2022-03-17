import {OrderCreatedEvent, Publisher, Subjects} from "@mohamed-ticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: OrderCreatedEvent["subject"]=Subjects.OrderCreated;

}