import connectDB from "@/lib/middleware/mongodb";
import { findAndValidateUserByToken } from "@/lib/models/user";
import { createRouter } from "next-connect";

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures that we are connected to the DB
handler.use(connectDB);

handler.post(async (req, res) => {
    const token = req.body;

    if (!token){
        res.status(400).json({success: false, status: 400, message: "Missing token."});
    }

    let isUpdated;

    try {
        // Function finds the user with the provided token and then validating their email if found
        isUpdated = await findAndValidateUserByToken(token);
    }
    catch(err){
        res.status(400).json({success: false, status: 400, message: "Unable to find a user with that token."});
    }


    // Update was successful
    if(isUpdated) {
        res.status(200).json({success: true, status: 200, message: "Email validated."});
        res.end();
    }
    else{
        res.status(400).json({success: false, status: 400, message: "Unable to find user."});
    }
});

export default handler.handler({
    onError: (err, req, res) => {
        console.error(err.stack);
        res.status(err.statusCode || 500).end(err.message);
    },
});