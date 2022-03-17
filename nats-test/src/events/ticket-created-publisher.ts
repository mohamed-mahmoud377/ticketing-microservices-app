import {Publisher} from "./publisher";
import {TicketCreatedEvent} from "./ticket-created-event";
import {Subjects} from "./subject";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject:Subjects.TicketCreated = Subjects.TicketCreated;

}