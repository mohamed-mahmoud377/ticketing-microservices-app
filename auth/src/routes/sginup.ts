import express, {NextFunction} from 'express';
import {body, validationResult} from "express-validator";
import {Response, Request} from "express";

import {User} from "../models/user";
import {BadRequestError,validateRequest} from "@mohamed-ticketing/common";
import jwt from 'jsonwebtoken'


const router = express.Router();


router.post('/api/users/signup', [
        body('email')
            .isEmail().withMessage("Email must be valid "),
        body('password')
            .trim()
            .isLength({min: 8, max: 40})
            .withMessage("password must be less than 40 and more than 7 characters")
    ],validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {

        const {email, password} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            throw new BadRequestError("Email in use");
        }
        const user = User.build({email, password})
        await user.save();
        // note that tsIgnore will make the error disappear but you can use this ! in the end as above to till TS to stop too
        // @ts-ignore
        const userJwt = jwt.sign({id:user.id,email:user.email},process.env.JWT_KEY!)
        req.session = {jwt: userJwt};

        res.status(201).send(user);


    })

export {router as signupRouter}