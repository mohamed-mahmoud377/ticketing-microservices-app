import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator'

import {User} from "../models/user";
import {BadRequestError,validateRequest} from "@mohamed-ticketing/common";
import {PasswordManger} from "../services/password-manger";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post('/api/users/signin',[ // this body function works as a middleware to validate
    // note that it adds the results in our req
    body('email') // the name of the filed you want to validate
        .isEmail()
        .withMessage("Email is not valid"),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('PasswordManger can not be empty')

],validateRequest,async (req:Request ,res:Response)=>{

    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (!existingUser) {
       throw new BadRequestError("Invalid credentials");
    }
    const passwordMatch = await PasswordManger.compare(existingUser.password,password);
    if (!passwordMatch){
        throw new BadRequestError("Invalid Credentials");

    }

    // note that tsIgnore will make the error disappear but you can use this ! in the end as above to till TS to stop too
    // @ts-ignore
    const userJwt = jwt.sign({id:existingUser.id,email:existingUser.email},process.env.JWT_KEY!)
    req.session = {jwt: userJwt};

    res.status(200).send(existingUser);

})

export { router as signinRouter}