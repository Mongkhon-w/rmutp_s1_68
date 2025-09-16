// app/index.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { encode, decode } from "./service";

const prisma = new PrismaClient();
const app = new Hono();

// GET /profile -> decode ก่อนส่งออก
app.get("/profile", async (c) => {
  const profiles = await prisma.profile.findMany();

  const decoded = profiles.map((p) => ({
    ...p,
    mobile: decode(p.mobile),
    cardId: decode(p.cardId),
  }));

  return c.json(decoded);
});

// POST /profile -> encode แล้วบันทึก, ไม่ decode ตอนตอบกลับ
app.post("/profile", async (c) => {
  const body = await c.req.json();
  console.log("input of profile", body);
  console.log("body.password(original)", body.password);

  // ตรวจซ้ำด้วยการ decode ค่าที่มีอยู่แล้วมาเทียบกับ input
  const existing = await prisma.profile.findMany({
    select: { id: true, mobile: true, cardId: true },
  });

  const duplicatedFields: string[] = [];
  for (const p of existing) {
    try {
      const m = decode(p.mobile);
      if (m === body.mobile) duplicatedFields.push("mobile");
    } catch {}
    try {
      const cId = decode(p.cardId);
      if (cId === body.cardId) duplicatedFields.push("cardId");
    } catch {}
    if (duplicatedFields.length) break;
  }

  if (duplicatedFields.length) {
    return c.json({ message: `ข้อมูลซ้ำ: ${duplicatedFields.join(", ")}` }, 503);
  }

  // เข้ารหัสค่าที่ต้องปกป้อง (log [ENCODE] จะออกตรงนี้)
  const encMobile = encode(body.mobile);
  const encCardId = encode(body.cardId);

  // hash password (ไม่ log hash)
  body.password = await bcrypt.hash(body.password, 18);

  // บันทึก
  const result = await prisma.profile.create({
    data: {
      ...body,
      mobile: encMobile,
      cardId: encCardId,
      status: false,
    },
  });

  // ไม่ decode ตอน POST
  c.status(200);
  return c.json({
    message: "create profile completed",
    data: result,
  });
});

export default app;