import {createRouter} from 'next-connect';
import connectDB from '@/lib/middleware/mongodb';

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures we have a connection to the DB established
handler.use(connectDB);

// If successful, passes a cookie with a JWT token to the client's browser, used for auth client and server-side
handler.post(async (req, res) => {
    res.setHeader('Set-Cookie', `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict; httpOnly=true; Max-Age=0; Path=/`);
    res.status(200).json({success: true, status: 200});
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});