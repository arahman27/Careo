import Head from "next/head";
import { Inter } from "next/font/google";
import TabNavigation from "@/components/TabNavigation";
import { Modal, Container, Button, Form} from "react-bootstrap";
import { useState } from "react";
import { deleteUser, logoutUser, updatePasswordForLoggedInUser } from "@/lib/authenticate";
import { useRouter } from "next/router";
import bcrypt from 'bcryptjs';
import Link from 'next/link'
import { useAtomValue } from "jotai";
import { userAtom } from "@/store";

const inter = Inter({ subsets: ["latin"] });

export default function AccountDetails(){
    
    // Get user's data from userAtom
    const userData = useAtomValue(userAtom);

    const router = useRouter();
    // Using a modal to show an alert window that prompts the user to re-enter their email to confirm. Variables used are below
    const [deleteAccountModal, setDeleteAccountModal] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    // Using a modal to show and alert window to reset a password. Variables used will be below
    const [updatePasswordModal, setUpdatePasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");


    const handleDeleteUser = async(e) => {
        e.preventDefault();


        if (!passwordInput || !emailInput){
            alert("Please fill in the email and password fields to delete your account.");
            return;
        }

        //Compare entered password with the one stored on the user's account
        if(!bcrypt.compare(passwordInput, userData.password)){
            alert("The provided password was incorrect, please try again.");
        }

        bcrypt.compare(passwordInput, userData.password, function(err, result) {
            if(err){
                console.error("Error comparing passwords: ", err);
                return;
            }

            // If passwords match
            if(result){

                if(emailInput !== userData.email){
                    alert("The provided email does not match the one associated with your account");
                    return;
                }

                //Hashing password before sending it off
                const hashedPassword = bcrypt.hash(passwordInput, 10);

                const wasSuccessful = deleteUser(emailInput, hashedPassword);

                if(wasSuccessful){
                    alert("Deletion was successful. Thank you for using CareO.");
                    
                    //Log user out from the session
                    logoutUser();
                    
                    router.push('/')

                    //Refresh the page to remove the log in status of the user
                    router.reload();
                }
                else{
                    alert("Unable to delete your account please contact support at careoprj666@gmail.com.");
                }
            }
            // If the passwords don't match
            else{
                alert("The entered password does not match the one associated with your account.");
            }
        });
    }

    const handleResetPassword = async(e) => {
        e.preventDefault();

        // Make sure the fields are not empty
        if (!oldPassword || !newPassword || !confirmNewPassword){
            alert("Please fill in all fields, if you wish to update your password.")
            return;
        }

        // Making sure that the entered old password matches the one stored on DB
        bcrypt.compare(oldPassword, userData.password, function(err, result) {
            if(err){
                console.error("Error comparing passwords: ", err);
                return;
            }

            // If passwords match
            if(result){

                // If previous check passed then check if new passwords match
                if (newPassword != confirmNewPassword){
                    alert("New passwords do not match.");
                    return;
                }

                // Making sure the new password follows our validation rules
                // Password validation regular expression
                const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*?_<>.,()[\]|]).{8,}$/;

                if (!passwordRegex.test(newPassword)){
                    alert("New password must contain at least 8 characters, 1 number, and 1 special character (#,$^,?,etc.)")
                    return;
                }        

                const wasSuccessful = updatePasswordForLoggedInUser(userData.email, newPassword);

                if (wasSuccessful){
                    alert("Your password was successfully updated.");
                    //Hide modal and reset fields after the update was done
                    setUpdatePasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                }
                else{
                    alert("There was an error updating your password please contact our support team, careoprj666@gmail.com.");
                }
            }
            // If they don't
            else{
                alert("provided old password does not match");
                return;
            }
        });        
    }

    return (
        <>

        <Head>
            <title>Account Details</title>
            <meta name="account" content="View your account" />
            <meta name="viewport" content="width-device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={`${inter.className}`}>
            <div style={{textAlign:"center"}} id="hero-text">
                <h3>Account</h3>
                <TabNavigation/>
            </div>
            <div className='centered' style={{paddingTop: '20px'}}>
                <Form id="account-info-form">
                    <Form.Group>
                        <Form.Label>Email:</Form.Label>
                        <Form.Control type="email" value={userData.email} id="userName" name="userName" readOnly/>
                        <Form.Label>Password:</Form.Label>
                        <Form.Control type="email" value="*************" id="password" name="password" readOnly/>
                    </Form.Group>
                </Form>
            </div>
            <br />
            <Container fluid style={{marginBottom: "5em"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <Button style={{marginRight: "10px"}} type="button" class="btn btn-warning" onClick={() => setUpdatePasswordModal(true)} >Update Your Password</Button>
                    <Button style={{marginRight: "10px"}} type="button" class="btn btn-danger" onClick={() => setDeleteAccountModal(true)} >Delete Your Account</Button>
                    <Link href="/orders"><Button variant="light">View Orders</Button></Link>
                </div>
            </Container>

            {/* Modal (Alert Window For Delete Account) */}
            <Modal className="delete-modal" show={deleteAccountModal} onHide={() => setDeleteAccountModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{color:"white"}}>Are you sure you want to delete your account? <br />Please re-enter your email and password to confirm</p>
                    {/* Using a form to get user input */}
                    <Form.Control type="text" placeholder="Enter your email." value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                    <br/>
                    <Form.Control type="password" placeholder="Enter your password." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setDeleteAccountModal(false)}>No</Button>
                        <Button variant="danger" onClick={handleDeleteUser}>Yes</Button>
                    </Modal.Footer>
                </Modal.Body>
            </Modal>

            {/* Modal (Alert Window To Reset a Password) */}
            <Modal show={updatePasswordModal} onHide={() => setUpdatePasswordModal(false)}  className="reset-password-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Update Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Old Password:</Form.Label>
                    <Form.Control type="password" placeholder="newPassword123" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                    <br/>
                    <Form.Label>New Password:</Form.Label>
                    <Form.Control type="password" placeholder="newPassword123" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <br/>
                    <Form.Label>Confirm New Password:</Form.Label>
                    <Form.Control type="password" placeholder="newPassword123" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    <br />
                    <p>Passwords must contain at least 8 characters, 1 number, and 1 special character (#,$^,?,etc.)</p>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setUpdatePasswordModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleResetPassword}>Yes</Button>
                    </Modal.Footer>
                </Modal.Body>

            </Modal>
      </main>

        </>
    )
}