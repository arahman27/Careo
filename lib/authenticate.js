import { jwtVerify } from 'jose';

// Used for getting the JWT secret for signing and verifying
export async function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  //console.log("SECRET: " + secret);
  if (!secret) {
    throw new Error("No JWT secret or key in env file");
  }
  return new TextEncoder().encode(secret);
}

// Return the raw payload of the token if valid, else return null
export async function verifyJwtToken(token) {
  try {
    const verification = await jwtVerify(token, await getJwtSecretKey());
    const payload = verification.payload;
    // Marks token as invalid if past expiry
    if (payload.exp > new Date().getTime()) {
      return null;
    }
    return payload;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function authenticateUser(email, password) {
  const res = await fetch(`/api/user/login`, {
    method: 'POST',
    body: JSON.stringify({ 'email': email, 'password': password }),
    headers: {
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200) {
    return true;
  } else {
    throw new Error(data.message);
  }
}

export async function logoutUser() {
  const res = await fetch(`/api/user/logout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200) {
    return true;
  } else {
    throw new Error(data.message);
  }
}

export async function registerUser(email, password){
  const res = await fetch(`/api/user/register`, {
    method: 'POST',
    body: JSON.stringify({email: email, password: password}),
    headers:{
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200) {
    return true;
  } else {
    throw new Error(data.message);
  }
}

export async function validateEmail(token){
  
  // Extracting the token
  const verificationToken = token.verificationToken; 
  
  const res = await fetch(`/api/user/email-validation`, {
    method: 'POST',
    body: JSON.stringify({verificationToken}),
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log("Response from server:", res); // Log the response

  const data = await res.json();

  if (res.status === 200){
    return true;
  }
  else{
    throw new Error(data.message);
  }
}

export async function findUserByEmail(email){
  const res = await fetch(`/api/user/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({email}),
    headers: {
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200){
    return true;
  }
  else{
    throw new Error(data.message);
  }
}

export async function updateUserPassword(userId, password){
  const res = await fetch(`/api/user/update-password`, {
    method: 'POST',
    body: JSON.stringify({id : userId, password : password}),
    headers: {
      'content-type' : 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200){
    return true;
  }
  else{
    throw new Error(data.message);
  }
}

// Used when User wants to delete their account. Made them login info for verification reasons
export async function deleteUser(email, password){
  const res = await fetch('/api/user/delete', {
    method: 'DELETE',
    body: JSON.stringify({email : email, password : password}),
    headers : {
      'content-type' : 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200){
    return true;
  }
  else{
    throw new Error(data.message);
  }
}

// As the name suggests this is for when the user is logged in an looking at the account details page.
// Grabbing the id from the userData variable on that page produces an unexpected result when looking for the user with just the id. 
// So opting to use the email for now, we could change it later, but it might require a new route or changes to a previous api route, like /api/user/update-password
export async function updatePasswordForLoggedInUser(email, password){
  const res = await fetch('/api/user/update-password-logged-in', {
    method: 'POST',
    body: JSON.stringify({email : email, password : password}),
    headers : {
      'content-type' : 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200){
    return true;
  }
  else{
    throw new Error(data.message);
  }
}