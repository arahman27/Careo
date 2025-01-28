import {createRouter} from 'next-connect';
import { SignJWT } from 'jose';
import { checkUser } from '@/lib/models/user';
import { getJwtSecretKey } from '@/lib/authenticate';
import connectDB from '@/lib/middleware/mongodb';

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures we have a connection to the DB established
handler.use(connectDB);

// If successful, passes a cookie with a JWT token to the client's browser, used for auth client and server-side
handler.post(async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).json({success: false, status: 400, message: "Missing email or password in login request."});
  }

  let user;
  // Get the user from the db
  try {
    user = await checkUser({email, password});
  } catch(err) {
    res.status(400).json({success: false, status:400, message: "Invalid username or password."});
  }
  console.log("Got user from db");

  if (user) {
    // create the token payload
    const payload = {_id: user._id, email: user.email};

    // sign the token
    const token = await new SignJWT({payload}).setProtectedHeader({alg: "HS256"}).setIssuedAt().setExpirationTime("30m").sign(await getJwtSecretKey());
    
    // set the cookie
    res.setHeader('Set-Cookie', `token=${token}; samesite=strict; httpOnly=true; Max-Age=${60*60*24}; Path=/`);
    res.status(200).json({success: true, status: 200});

    // sometimes nextjs complains about no response from this api route, no idea why so here we are
    res.end();
  } else {
    res.status(400).json({success: false, status: 400, message: "Unable to find user."});
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});