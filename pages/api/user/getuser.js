import { createRouter} from "next-connect";
import { verifyJwtToken } from "@/lib/authenticate";
import { findUserById } from '@/lib/models/user';

const handler = createRouter();

// Gets the full user profile and account data
handler.get(async (req, res) => {
  try {
    // Extract the user data from the cookie
    const {cookies} = req;
    if (cookies.token) {
      const data = await verifyJwtToken(cookies.token);
      const user = await findUserById(data.payload._id);
      //console.log("GOT USER: " + user);
      res.status(200).json(user);
    } else {
      throw new Error('No token found');
    }
  } catch(e) {
    console.log(e);
    res.status(400).json({status: 400, message: "JSON decode error, or no cookie found"});
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});