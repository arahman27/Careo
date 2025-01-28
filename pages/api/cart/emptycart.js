import { emptyUserCart } from "@/lib/models/cart";
import { createRouter} from "next-connect";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)


handler.get(async (req, res) => {
    const cart = await emptyUserCart(req.query.userId);
    res.status(200).json(cart);
});

export default handler.handler({
    onError: (err, req, res) => {
      console.error(err.stack);
      res.status(err.statusCode || 500).end(err.message);
    },
  });