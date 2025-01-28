import {createRouter, expressWrapper} from 'next-connect';
import { registerUser } from '@/lib/models/user';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';

import connectDB from '@/lib/middleware/mongodb';

// Use router so we can use middleware
const handler = createRouter();

// Database middleware ensures we have a connection to the db established before any queries
handler.use(connectDB);

// Does not add a cookie, redirects user to login
handler.post(async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).json({status: 400, message: "Missing email or password in request."});
    return;
  }

  try {
    // Generating verification token
    const verificationToken = generateVerificationToken();
    console.log("Generated token is: ", verificationToken);

    await registerUser({email, password, verificationToken});

    // Call function to send email to user
    await sendVerificationEmail(email, verificationToken);
  }
  catch(err) {
    res.status(400).json({status: 400, message: "User already exists."});
    return;
  }

  console.log("Got through checks in API register req");
  res.status(200).json({status: 200});
  return;
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});