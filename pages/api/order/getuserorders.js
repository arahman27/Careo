import { createOrder } from "@/lib/models/order";
import { createRouter} from "next-connect";
import { getOrdersByUserId } from "@/lib/models/order";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

// POST /api/order/getuserorders?userId=userId
handler.get(async (req, res) => {
    try {
        const userId = req.query.userId;
        res.status(200).json(await getOrdersByUserId(userId));
    } catch(e) {
        console.log(e);
        res.status(400).json({status: 400, message: "Error getting orders."});
    }
});

export default handler.handler({
    onError: (err, req, res) => {
      console.error(err.stack);
      res.status(err.statusCode || 500).end(err.message);
    },
  });