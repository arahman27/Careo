import connectDB from "@/lib/middleware/mongodb";
import { createRouter } from "next-connect";
import { findUserWithEmail } from "@/lib/models/user";
import { sendPasswordResetEmail } from "@/lib/email";

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures that we are connected to the DB
handler.use(connectDB);

handler.post(async (req, res) => {
    const userEmail = req.body;
    
    
    // Passed into the sent email, if found. This will be used to easily reset the password
    let userId;

    try{
        // Function finds and returns the user's id based on the entered email
        userId = await findUserWithEmail(userEmail);
    }
    catch(err){
        console.error(err);
        res.status(400).json({success: false, status: 400, message: "Error occured when trying to find user."});
    }

    if(userId){
        sendPasswordResetEmail(userEmail.email, userId);
        
        res.status(200).json({success: true, status: 200, message: "Email found."});
        res.end();
    }
    else{
        res.status(400).json({success: false, status: 400, message: "Unable to find user with that email."})
    }
})

export default handler.handler({
    onError: (err, req, res) => {
        console.error(err.stack);
        res.status(err.statusCode || 500).end(err.message);
    },
});
