import { createRouter} from "next-connect";

import { getAllConditions } from "@/lib/models/condition";
import connectDB from '@/lib/middleware/mongodb';


const handler = createRouter();
handler.use(connectDB)

// Gets the full user profile and account data
handler.get(async (req, res) => {
  const conditions = await getAllConditions();
  if (conditions && conditions.length > 0) {
    res.status(200).json({status: 200, conditions: conditions});
  } else {
    res.status(400).json({status: 400, message: "Unable to get conditions"});
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});