import { createRouter} from "next-connect";
import { verifyJwtToken } from "@/lib/authenticate";
import { addToSaved } from "@/lib/models/savedList";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.post(async (req, res) => {
  const {cookies} = req;

  if (cookies.token) {
    const data = await verifyJwtToken(cookies.token);
    const { productlist } = req.body;
    
    try {
        await addToSaved(data.payload._id, productlist);
        
    }
    catch(err) {
        res.status(400).json({status: 400, message: err.message});
        return;
    }

  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});