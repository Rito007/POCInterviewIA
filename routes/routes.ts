import { Request, Response, Router } from "express";

const router = Router();

router.get("/",(req : Request, res:Response)=>{
    res.sendFile("/index.html")
})

export default router;