import { createRouter} from "next-connect";
import { verifyJwtToken } from "@/lib/authenticate";
import { delSavedList } from "@/lib/models/savedList";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.get(async (req, res) => {
  const {cookies} = req;

  if (cookies.token) {
    const data = await verifyJwtToken(cookies.token);
    await delSavedList(data.payload._id);
    
    res.status(200).json({status: 200});

  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});