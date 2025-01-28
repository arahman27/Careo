import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { validateEmail } from "@/lib/authenticate";
import { useState } from "react";
import Link from "next/link";


export default function EmailVerification(){
    const router = useRouter();
    const [verificationStatus, setVerificationStatus] = useState(null);

    const handleSubmit = async (e) => {
        try{
            // Get the token
            const verificationToken = router.query;

            // Attemping to verify email
            await validateEmail(verificationToken);

            // Unhides link to login page
            setVerificationStatus('success');
        }
        catch(err) {
            console.log(err);
            setVerificationStatus('error');
        }

    }

    return (
        <>
            <div style={{textAlign: "center"}} id="hero-text">
                <h1>Email Verification</h1>
                <Button style={{margin:"1rem"}}onClick={handleSubmit}>Click here to verify your email</Button>

                {verificationStatus === 'success' && (
                    <p>
                        Email verified successfully. <Link href="/login">Click here to login</Link>
                    </p>
                )}
                {verificationStatus === 'error' && (
                    <p>Error verifying email. Please try again.</p>
                )}
            </div>
        </>
    )
}