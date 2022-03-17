import {ExpirationCompleteEvent, Publisher, Subjects} from "@mohamed-ticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: ExpirationCompleteEvent["subject"]= Subjects.ExpirationComplete;

}