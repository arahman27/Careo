import connectDB from "@/lib/middleware/mongodb";
import { createRouter } from "next-connect";
import { deleteUserAccount } from "@/lib/models/user";

// Use create router to enable the use of additional middleware
const handler = createRouter();

// DB middleware ensures that we are connected to the DB
handler.use(connectDB);

handler.delete(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);

    // Will be used to confirm if the user was successfully removed or not
    let wasDeleted = false;

    try{
        //Function attempts to find and delete user with provided password
        wasDeleted = await deleteUserAccount(email, password);
    }
    catch(err){
        console.log(err);
        res.status(400).json({success: false, status: 400, message: "Error occurred when finding trying to find and delete user."});
    }

    if(wasDeleted){
        console.log("User deleted!");
        res.status(200).json({success: true, status: 200, message: "User deleted."});
        res.end();
    }
    else{
        res.status(400).json({success: false, status: 400, message: "Unable to find user with the email or password provided."});
    }
})

export default handler.handler({
    onError: (err, req, res) => {
        console.error(err.stack);
        res.status(err.stackCode || 500).end(err.message);
    }
})