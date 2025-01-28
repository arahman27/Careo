import { createRouter} from "next-connect";
import { verifyJwtToken } from "@/lib/authenticate";
import { getSavedList } from "@/lib/models/savedList";
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

handler.get(async (req, res) => {
  const {cookies} = req;

  if (cookies.token) {
    const data = await verifyJwtToken(cookies.token);
    const savedLists = await getSavedList(data.payload._id);
    
    if (savedLists && savedLists.length > 0) {
      res.status(200).json({status: 200, savedLists: savedLists});
    } else {
      res.status(400).json({status: 400, message: "Unable to get saved lists"});
    }
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});