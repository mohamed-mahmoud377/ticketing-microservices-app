import nats from 'node-nats-streaming'
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

console.clear()


const stan = nats.connect('ticketing','abc',{
    url: 'http://localhost:4222'                 // connecting to nats from local host only passable because of port-forwarding

});




stan.on('connect',async ()=>{
    console.log('publisher connected to nats');
    const data = JSON.stringify({
        it: '124',
        title: 'concert',
        price:20
    })
    const pub =new TicketCreatedPublisher(stan);
    try{
        await pub.publish({ // so now the publish function is turned anto a promise which is i like
            title:"jerry",
            price:32,
            id:"123"
        })
    }catch (e) {
        console.log(e)
    }

})



