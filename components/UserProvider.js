import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom, cartItemsAtom } from '@/store';

const UserProvider = ({ children }) => {
  const [user, setUser] = useAtom(userAtom);
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);

  useEffect(() => {  
    if (user && user._id) return; // If user is already logged in, don't fetch user data
    fetch('/api/user/getuser') // fetch user data from api
        .then(response => response.json())
        .then(data => setUser(data)) // set userAtom
        .catch(e => {
            if (e.message != "Error: No token found") { // We don't need to do anything if the user is not logged in
                console.log(e)
            }
        }
        );
  }, []); // eslint-disable-line

  
  useEffect(() => {
    if (user && user._id) {
      fetch('/api/cart/getcart?userId=' + user._id) // fetch cart items from api
        .then(res => res.json())
        .then(data => setCartItems(data.items)); // set cartItemsAtom
    }
  }, [user]); // eslint-disable-line

  return children;
};

export default UserProvider;
