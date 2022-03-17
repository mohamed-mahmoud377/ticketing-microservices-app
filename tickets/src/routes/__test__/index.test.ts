import request from "supertest";
import {app} from "../../app";



const createTicket = ()=>{
    return request(app)
        .post('/api/tickets')
        .set('Cookie',global.getAJWTCookie())
        .send({
            title:'testTitle',
            price:10
        })
}
it('should fetch al list of tickets', async function () {

    await createTicket();
    await createTicket();
    await createTicket();

    const response  = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3);

});