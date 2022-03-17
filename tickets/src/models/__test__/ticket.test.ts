import {Ticket} from "../ticket";

it('should implement optimistic concurrency control ', async function () {
    //create an instance of a ticket
    const ticket = Ticket.build({
        title:'concert',
        price:5,
        userId:'234'
    })
    // save the ticket ot the database
    await ticket.save()
    //fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id); // this is with version 1
    const secondInstance = await Ticket.findById(ticket.id) // this is with  version 1

    //make two separate change to the tickets we fetched
    firstInstance!.set({
        price:10
    })                        // updating
    secondInstance!.set({
        price:10
    })           // updating


    //save the first fetched ticket
    await firstInstance!.save();          // before saving the version is 1 and after saving it will be 2

    //save the second fetched ticket

    try{
        await secondInstance!.save();    // now this has a version of 1 and the current version is 2 so updating won't be passable and
        //mongoose will throw an error
    }catch (e) {
         return ;
    }


    throw new Error('Should not reach this point')


});


it('should increments the version number on multiple saves ]', async function () {
    const ticket = Ticket.build({
        title:'concert',
        price:20,
        userId:'123'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);


});