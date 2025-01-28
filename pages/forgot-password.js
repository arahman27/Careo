import Head from "next/head";
import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useRouter } from "next/router";
import { updateUserPassword } from "@/lib/authenticate";


export default function ForgetPassword(){

    const [passwordOne, setPasswordOne] = useState("");
    const [passwordTwo, setPasswordTwo] = useState("");
    const [warning, setWarning] = useState("");
    
    const router = useRouter();

    const handleSubmit = async(e) =>{
        e.preventDefault();
        
        try{

            // Password validation regular expression
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*?_<>.,()[\]|]).{8,}$/;

            // Check is fields are empty
            if (!passwordOne.trim() || !passwordTwo.trim()){
                setWarning("Passwords do not match.");
                return;
            }

            // See if they match
            if(passwordOne !== passwordTwo){
                setWarning("Passwords do not match.");
                return;
            }

            // Making sure it passes the password standard
            if(!passwordRegex.test(passwordOne)){
                setWarning("Password must contain at least 8 characters, 1 number, and 1 special character (#,$^,?,etc.)")
                return;
            }

            try{
                // Get the passed ID
                const userId = router.query;
                await updateUserPassword(userId, passwordOne);

                alert("Your password was updated.");
                router.push("/login");
            }
            catch(err){
                alert("Unable to update password. Please contact support ", process.env.COMPANY_EMAIL);
                console.log(err);
            }


        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <>
            <Head>
                <title>Reset Password</title>
                <meta name="description" content="Reset Password"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <div style={{textAlign: "center"}} id="hero-text">
                <h1>Password Reset</h1>
                <h4>Please enter your new password</h4>
            </div>
            <div className="centered" style={{paddingTop: "50px"}}>
                <Form id="password-rest-form" onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>New Password:</Form.Label>
                        <Form.Control type="password" value={passwordOne} id="passwordOne" name="passwordOne" onChange={(e)=>setPasswordOne(e.target.value)} placeholder="Enter new password" />                        
                    </Form.Group>
                    <br />
                    <Form.Group>
                        <Form.Label>Confirm Your New Password:</Form.Label>
                        <Form.Control type="password" value={passwordTwo} id="passwordTwo" name="passwordTwo" onChange={(e)=>setPasswordTwo(e.target.value)} placeholder="Enter the password again" />
                    </Form.Group>
                    
                    <Form.Label style={{fontSize: '13px'}}>Passwords must have a length of at least 8 characters, with 1 number, and 1 special character (#,$^,?,etc.)</Form.Label>
                    
                    {warning && <><br/><Alert variant='danger'>{warning}</Alert></>}

                    <div className="centered" id="password-reset-button">
                        <Button variant="primary" className="pull-right" type="submit">Reset Password</Button>
                    </div>
                </Form>
            </div>
        </>
    )
}