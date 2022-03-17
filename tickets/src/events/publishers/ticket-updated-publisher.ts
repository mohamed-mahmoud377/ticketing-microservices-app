import {Publisher, Subjects,TicketUpdatedEvent} from "@mohamed-ticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;

}
