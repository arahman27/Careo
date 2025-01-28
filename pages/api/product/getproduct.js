import { createRouter} from "next-connect";
import { getProduct } from "@/lib/models/product";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.get(async (req, res) => {
    const productId = req.query.productId;
    const product = await getProduct(productId);
    res.status(200).json(product);
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});