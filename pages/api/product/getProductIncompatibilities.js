import { createRouter} from "next-connect";
import { getIncompatibilitiesByIngredientId } from "@/lib/models/incompatible";
import { getProduct } from "@/lib/models/product";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.get(async (req, res) => {
    const productId = req.query.productId;
    const product = await getProduct(productId);
    let incompatibilities = new Set();
    for (let i = 0; i < product.ingredients.length; i++) {
      let incompats = await getIncompatibilitiesByIngredientId(product.ingredients[i]);
      incompats.forEach(incompat => incompatibilities.add(incompat));
    }
    res.status(200).json(Array.from(incompatibilities));
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});