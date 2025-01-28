import { createRouter} from "next-connect";
import { getCartDataByUserId } from "@/lib/models/cart";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

// GET /api/cart?userId=userId
handler.get(async (req, res) => {
    const userId = req.query.userId;
    const cart = await getCartDataByUserId(userId);
    res.status(200).json(cart);
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});