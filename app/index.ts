import { Hono } from "hono";
import { PrismaClient } from '@prisma/client'
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
// import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();
const app = new Hono();

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(String(process.env.SECRET_KEY || "my-secret-key"))
  .digest("base64")
  .substr(0, 32); // 32 bytes key
const IV = Buffer.from("1234567890123456");

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}


function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(text, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}



app.get('/', (c) => c.text('Hono!'));
app.get('/about', (c) => { return c.json({ message: "Tanapat Nunkhong " }) });
app.get("/profile", async (c) => {
    // logic
    const profile = await prisma.profile.findMany();
    
    const decodedProfiles = profile.map((p) => ({
    ...p,
    mobile: decrypt(p.mobile),
    cardId: decrypt(p.cardId),
  }));

    
    return c.json(decodedProfiles);
});
app.post("/profile", async (c) => {
    //logic to create a new profile
    const body = await c.req.json();
    console.log('input of profile', body);
    console.log('body.password(original)', body.password);

   
    
    // ตรวจสอบว่ามี mobile หรือ cardId ซ้ำ
    const existingProfile = await prisma.profile.findFirst({
        where: {
            OR: [
                { mobile: encrypt(body.mobile) },
                { cardId: encrypt(body.cardId) }
            ]
        }
    });

    if (existingProfile) {
    let duplicatedFields = [];
    if (decrypt(existingProfile.mobile) === body.mobile) duplicatedFields.push('mobile');
    if (decrypt(existingProfile.cardId) === body.cardId) duplicatedFields.push('cardId');

        return c.json(
            { message: `ข้อมูลซ้ำ: ${duplicatedFields.join(', ')}` },
            503
        );
    }
    

    //encode password
    const passwordHash = await bcrypt.hash(body.password,18);
    console.log('hash.password(after)',passwordHash);
    body.password = passwordHash;
    console.log('body.password(replace)',body);


    //save to db
    body.mobile = encrypt(body.mobile);
    body.cardId = encrypt(body.cardId);
    body.status= false;
    const result = await prisma.profile.create({
        data:body
    });

   
     // decode ก่อนส่งกลับ
    const output = {
        ...result,
        mobile: decrypt(result.mobile),
        cardId: decrypt(result.cardId),
    };

    // output
     c.status(200);
    return c.json({
        message: "create profile completed",
        data: result
    })
});

export default app;