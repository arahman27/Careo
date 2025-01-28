import { Button } from "react-bootstrap"
import { useRouter } from "next/router";
import { useAtom, useAtomValue, atom } from "jotai";
import {Col, Row } from "react-bootstrap"; 
import ProductCard from "@/components/ProductCard";
import { userAtom, cartItemsAtom } from "@/store";
import TabNavigation from "@/components/TabNavigation";
import { useEffect } from "react";

export default function ShoppingCart(){
    const router = useRouter();
    const user = useAtomValue(userAtom);
    const [cartItems, setCartItems] = useAtom(cartItemsAtom);
    
    // Get user's data from userAtom
    const userData = useAtomValue(userAtom);

    useEffect(() => {
        if (!user || !user._id) return;
        console.log('getting cart items')
        fetch("/api/cart/getcart?userId=" + user._id).then(res => res.json()).then(data => {
            console.log('got cart items')
            console.log(data);
            setCartItems(data.items);
        });
    }, [user, setCartItems]);

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (cartItems.length == 0) {
            alert("You can not place an order until you have an item in your cart.");
            return;
        }

        if (!userData.emailVerified) {
            alert("You cannot place an order until you verify your email. Please look for an email from the sender careoprj666 in your email.");
            return;
        }
        
        router.push('/place-order');
        
    }
    return (
        <>
            <div style={{textAlign:"center"}} id="hero-text">
                <h3 style={{fontFamily:"sans-serif"}}>My Cart</h3>
                <TabNavigation/>
            </div>
            <div>
                <div id="cart-items" className='centered' style={{paddingTop: '50px', paddingLeft: '30px'}}>
                    {cartItems?.length > 0 ?
                        <Row className="gy-4" style={{width:'100%'}}>
                            {cartItems.map((item, i) => (
                                <Col lg={3} key={i}><ProductCard cartItem={item} /></Col>
                            ))}
                        </Row> : <><br/><br/><h4>No items in the cart.</h4></>
                    }
                </div>
                <div className='centered' style={{paddingTop: '50px'}}>
                    <Button variant="success" className="btn-checkout" type="submit" onClick={handleCheckout}>
                        Checkout
                    </Button>
                </div>
            </div>
        </>
    );
}