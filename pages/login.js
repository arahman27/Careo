import { Form, Alert, Button } from "react-bootstrap"
import { useState } from 'react';
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";

import { userAtom } from "@/store";
import { authenticateUser } from "@/lib/authenticate";
import { getUserData } from "@/lib/userData";
import Link from "next/link";

export default function Login(){
    // Use this atom to see if user data is set, i.e. if the user is logged in for the purposes of dynamic views (hide login button etc.)
    const [userData, setUserData] = useAtom(userAtom);
    const router = useRouter();

    // TODO: Move this functionality to middleware
    useEffect(() => { // Only run this effect once, when the component mounts
        if (userData && userData.email) { // If user is already logged in, redirect to home page
            if (userData.age) 
                router.push('/user-profile');
            else if (userData.email)
                router.push("/create-profile");
        }}
    , [userData, router]);

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [warning, setWarning] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!user.trim() || !password.trim()){
            setWarning("Please fill out all fields.");
        }

        try {
            // attempt user login
            await authenticateUser(user, password);
            // get user profile data
            const data = await getUserData();
            
            //TODO: clean data to prevent hashed password leak; low priority

            // set user profile data
            setUserData(data);

            // Not necessary since we redirect in the useEffect
            //router.push('/create-profile');
            
        } catch(e) {
            console.log(e);
            //TODO: Notify the user in some way that user/pass was incorrect
        }
    }

    // Redirects user to the sign up page when called
    const redirectToSignUp = (e) => {
        e.preventDefault(); // Without this, the warning from handleSubmit will appear
        router.push("/sign-up");
    }

    return (
        <div>
            <div style={{textAlign:"center", fontFamily:"Inter, sans-serif"}} id="hero-text">
                <h2>Welcome to Careo</h2>
                <h5>Please log in to continue</h5>
            </div>
            <div className='centered' style={{paddingTop: '50px'}}>
                <Form id="login-form" onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Username:</Form.Label>
                        <Form.Control type="email" value={user} id="userName" name="userName" onChange={(e)=>setUser(e.target.value)} placeholder="john.smith@gmail.com"/>
                    </Form.Group>
                    <br />
                    <Form.Group>
                        <Form.Label>Password:</Form.Label>
                        <Form.Control type="password" value={password} id="password" name="password" onChange={(e)=>setPassword(e.target.value)} placeholder="Password123" />
                    </Form.Group>
                    {warning && <><br/><Alert variant='danger'>{warning}</Alert></>}
                    <br />
                    <div className="spaced-apart">
                        <Form.Check style={{width:'auto'}} type="checkbox" label="Remember Me" />
                        <Link style={{color:'green'}} href="forgot">Forgot password?</Link>
                    </div>
                    <br />
                    <div id="login-buttons" className="spaced-apart">
                        <Button variant="primary" className="pull-right" type="submit">Login</Button>
                        <Button variant="secondary" className="pull-right" type="submit" onClick={redirectToSignUp}>Sign Up</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}