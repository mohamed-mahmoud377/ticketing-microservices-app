import express from 'express';
import {currentUser} from "@mohamed-ticketing/common";



const router = express.Router();


router.get('/api/users/currentuser',currentUser,(req ,res)=>{
  res.send({currentUser: req.currentUser || null}); // takes the currentUser from the middleware if there was not
    // will simply send null
    // note that it will be undefined but we made it null

})

export { router as currentUser}