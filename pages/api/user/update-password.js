import connectDB from "@/lib/middleware/mongodb";
import { updateUsersPassword } from "@/lib/models/user";

import { createRouter } from "next-connect";

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures that we are connected to the DB
handler.use(connectDB);

handler.post(async (req, res) => {
    // Get the passed id and password

    const userId = req.body.id;
    const password = req.body.password

    if(!userId || !password){
        res.status(400).json({success: false, status: 400, message: "Missing the id or password."});
    }

    let isUpdated;

    try{
        // Function finds user with provided id and then encrypts and updates password
        isUpdated = await updateUsersPassword(userId, password);
    }
    catch(err){
        res.status(400).json({success: false, status: 400, message: "Unable to find a user with provided id."})
    }

    if(isUpdated){
        res.status(200).json({success: true, status: 200, message: "Password updated."});
        res.end();
    }
    else{
        res.status(400).json({success: false, status: 400, message: "Password was not updated."})
    }
});

export default handler.handler({
    onError: (err, req, res) => {
        console.error(err.stack);
        res.status(err.statusCode || 500).end(err.message);
    },
});