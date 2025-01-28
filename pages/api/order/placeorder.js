import { createOrder } from "@/lib/models/order";
import { createRouter} from "next-connect";
import { getCartDataByUserId } from "@/lib/models/cart";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

// POST /api/order/placeorder?shippingAddress=shippingAddress&billingAddress=billingAddress&paymentMethod=paymentMethod
handler.post(async (req, res) => {
    try {
        let order = req.body;
        const cart = (await getCartDataByUserId(order.user_id));
        
        if (!cart) {
            throw new Error('No cart found for user');
        }

        order.items = cart.items.map(item => { return {productId: item.productId._id, quantity: item.quantity}; });
        
        
        let total = 0;
        for (let item of cart.items) {
            total += item.productId.price * item.quantity;
        }
        
        order.total = total;
        order.total += 4.99; // Shipping, should put this somewhere instead of hardcoding
        order.total += order.total * 0.13; // Tax, same as above
        // round to 2 decimal places
        order.total = Math.round(order.total * 100) / 100;
        order.date = new Date();

        res.status(200).json(await createOrder(order));
    } catch(e) {
        console.log(e);
        res.status(400).json({status: 400, message: "Error placing order."});
    }
});

export default handler.handler({
    onError: (err, req, res) => {
      console.error(err.stack);
      res.status(err.statusCode || 500).end(err.message);
    },
  });