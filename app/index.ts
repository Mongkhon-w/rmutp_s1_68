import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "../generated/prisma/client";

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
    console.log('input of peofile', body);

    //output reponse
    return c.json({
        message : "create profile completed" 
    });    
});

export default app;
