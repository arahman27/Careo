import styles from "@/styles/Home.module.css";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Alert, Button, Form } from "react-bootstrap";
import { useState } from 'react';
import { findUserByEmail } from "@/lib/authenticate";

const inter = Inter({ subsets: ["latin"] });

export default function Forgot() {
    const [email, setEmail] = useState("");
    
    const submitEmail = async(e) => {
        e.preventDefault();
        
        if (!email.trim()){
            alert("Please fill in the email field.");
            return;
        }
        else{
            try{
                await findUserByEmail(email);
                alert("Please check your email for a password reset link.")

            } catch(e){
                console.log(e);
                alert("A user with that email was not found.");
            }
        }
    }
    return(
        <>
            <Head>
                <title>Forgot Password</title>
                <meta name="description" content="Forgot Password" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div style={{textAlign:"center"}} id="hero-text">
                <h1>Forgot Password</h1>
                <h4>Please enter your email address</h4>
            </div>
            <div className='centered' style={{paddingTop: '50px'}}>
                <Form id="login-form">
                    <Form.Group>
                        <Form.Label>Email:</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e)=>{setEmail(e.target.value)}}id="email" name="email" placeholder="youremail@example.com"></Form.Control>
                    </Form.Group>
                    <br/>
                    <div className="centered">
                        <Button variant="primary" onClick={submitEmail}>Submit</Button>
                    </div>
                </Form>
            </div>
        </>
    );    
}