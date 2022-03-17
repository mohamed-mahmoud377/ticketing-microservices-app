import {Publisher, Subjects, TicketCreatedEvent} from "@mohamed-ticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;

}
