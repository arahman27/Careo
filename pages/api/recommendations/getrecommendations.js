import { createRouter} from "next-connect";
import { verifyJwtToken } from "@/lib/authenticate";
import { recommend } from "@/lib/recommendation";
import { findUserById } from '@/lib/models/user';
import connectDB from '@/lib/middleware/mongodb';

const handler = createRouter();
handler.use(connectDB)

// Gets the full user profile and account data
handler.get(async (req, res) => {
    
    const {cookies} = req;
    if (cookies.token) {
        const data = await verifyJwtToken(cookies.token);
        const user = await findUserById(data.payload._id);

        const recs = await recommend(user);
        if (recs) {
          //console.log("Got Recommendations: " + JSON.stringify(recs));
          res.status(200).json(recs);
        } else {
          res.status(400).json({status: 400, message: "Unable to get recommendations"});
        }    
      }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});