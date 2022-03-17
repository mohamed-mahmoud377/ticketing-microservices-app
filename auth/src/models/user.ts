import mongoose,{HydratedDocument} from "mongoose";
import * as Mongoose from "mongoose";
import {PasswordManger} from "../services/password-manger";
interface UserAttrs{ // you may say that we don't need this anymore but you do when you are building the doc because the userDoc may have attr that
    // you don't need to provide
    email: string;
    password: string;
}

interface UserModel extends mongoose.Model<UserDoc>{  //here to are extending the Model so you can add more function to it
    // then you will have to use to actually create the model
    build(attrs:UserAttrs):UserDoc;
}

interface UserDoc extends mongoose.Document { //this is your document but why are we using it because here you can add any
    // attr that mongoose will add automatically by typing them so you can have access to it because of TS of course
    email:string;
    password:string;
}

const userSchema= new mongoose.Schema({ // by adding the userattrs in the schema like this you make sure that you make
    // the scheme exactly like the interface , but I removed them
    email: {
        type:String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true
    }
},{
    // note that this a view level stuff and we are doing it in the model not very MVCii but it is okey for now

    toJSON:{ // note that when you have an object you call JSON.stringfy() or something but this method calls toJSON method that
        // you can very easily override and write your own implementation
        // so note that in a microservice arch you need a consistent way of viewing you data so depending on mongoose is really
        // not a good idea because you may use other lang or another  DB so you have to say exactly how you want your json to be like
        // in our problem here you do not need __v and the id is called _id which is not what we want we want to be id
        // so you have to change it in a way that suits you
        //and mongoose has an object that does that
        // in the end all it is doing is overriding the toJSON function
        transform(doc,ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }

    }
})




userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next(); // this pre function will be called every time a new user have been created or even
    //updated so this really important to check if  the password was not modified just return and go the  next middleware
    const hashed = await PasswordManger.toHash(this.get('password'));// return a promise
    this.set('password',hashed);
    next();

});


userSchema.statics.build = (attrs:UserAttrs)=>{
    return new User (attrs);
}
const User = mongoose.model<UserDoc,UserModel>("User",userSchema);
 // new User<UserAttrs>({email:"jerry",password:"jerry"}) you can use the build function or this way for type check


export {User};