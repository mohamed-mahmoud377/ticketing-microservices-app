import {PaymentCreatedEvent, Publisher, Subjects} from "@mohamed-ticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: PaymentCreatedEvent["subject"] = Subjects.PaymentCreated;

}