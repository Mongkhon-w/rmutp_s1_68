import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "../generated/prisma/client";
import * as bcrypt from "bcrypt";

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
    console.log('input of profile ', body);
    console.log('body.password(original) ', body.password);

    //encode password
    const passwordHash = await bcrypt.hash(body.password, 15);
    console.log('hash.password(after) ', passwordHash);
    body.password = passwordHash;
    console.log('body.password(replace) ', body);

    //save to db
    body.status = false;
    const result =  await prisma.profile.create({
        data: body
    });

    //output reponse
    return c.json({
        message : "create profile completed",
        data: result 
    });    
});

export default app;
