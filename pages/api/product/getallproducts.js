import { createRouter} from "next-connect";
import { getAllProducts } from "@/lib/models/product";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.get(async (req, res) => {
    const products = await getAllProducts();
    res.status(200).json(products);

});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});