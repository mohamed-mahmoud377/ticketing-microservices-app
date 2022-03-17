import nats from "node-nats-streaming";
import {randomBytes} from "crypto";
import {TicketCreatedListener} from "./events/ticket-created-listener";


console.clear();

const stan = nats.connect('ticketing',randomBytes(4).toString('hex'),{
    url: "http://localhost:4222"
})



stan.on('connect',()=>{
    console.log('Listener connected to NATS');

    stan.on('close',()=>{
        console.log("NATS connection closed !")
        process.exit();
    })


 new TicketCreatedListener(stan).listen()



})


// why are we doing this ?
// because when the program close NATS still try to reach it but we closed ! like on purpose
// so in the closing process we tell NATS that we want to close the connection immediately
// so we don't waste time trying  to reach it
process.on('SIGINT',()=>stan.close()); // this for when you close the program with ctrl z
process.on('SIGTERM',()=>stan.close()); // this when docker tries to kill the process gracefully






