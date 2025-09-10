import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "../generated/prisma/client";
import * as bcrypt from "bcrypt";
// import { Md5 } from "md5-typescript";
import { encode, decode } from "./service";

const prisma = new PrismaClient();

const app = new Hono();
app.get("/", (c) => c.text("Hello, World!"));
app.get("/about", (c) => {
    return c.json({
        message: "Mongkhon Wichaiphap"
    });
});
app.get("/profile", async(c) => {
    //logic
    const profiles = await prisma.profile.findMany();
    return c.json(profiles);    
});
app.post("/profile", async (c) => {
    //logic to create a new profile
    const body = await c.req.json();
    // console.log('input of profile ', body);
    // console.log('body.password(original) ', body.password);

    //encode password
    const passwordHash = await bcrypt.hash(body.password, 13);
    // console.log('hash.password(after) ', passwordHash);
    body.password = passwordHash;
    // console.log('body.password(replace) ', body);

    //encode mobile
    // body.mobile = Md5.init(body.mobile);
    body.mobile = encode(body.mobile);

    //encode cardId
    // body.cardId = Md5.init(body.cardId);
    body.cardId = encode(body.cardId);

    //data before save
    console.log('data before save ', body);
    // return c.json({
    //     message: "data before save",
    //     data: body
    // });
    
    //save to db
    body.status= false;
    const result = await prisma.profile.create({
        data: body
    })
    .then(data => { 
        delete data.password;
        console.log('create profile completed', data);
        return data;
    })
    .catch(err => {
        console.log(`create profile failed `, JSON.stringify(err?.message));
        // switch case error message
        return "please recheck username, mobile or cardId";
    });

    //output response
    return c.json({
        message: "create profile completed",
        data: result
    });
});
app.get("/profile/:id", async (c) => {
    //get some data from db
    const id = c.req.param('id');
    console.log('id ', id);
    const profile = await prisma.profile.findFirstOrThrow({
        where: {
            id: id
        }
    });
    delete profile.password;

    return c.json({
        message: "get data completed",
        data: profile
    }, 200);
});

export default app;