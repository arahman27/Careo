import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import { useEffect, useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { userAtom, cartItemsAtom } from '@/store';


export default function ArtworkCard(prop) {
    const [product, setProduct] = useState({});
    const [quantity, setQuantity] = useState(product.quantity)
    const [cart, setCart] = useAtom(cartItemsAtom);
    const user = useAtomValue(userAtom);

    useEffect(() => {
        setProduct(prop.cartItem);
        setQuantity(product.quantity)
    }, [prop.cartItem])

    function removeFromCart() {
        fetch("/api/cart/removefromcart?userId=" + user._id + "&productId=" + product.productId._id + "&quantity=1", {
            method: 'POST'
        }).then(res => res.json()).then(data => {
            setCart(data.items);
        });
    }
    
    function formatPrice(price){
        return Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(price);
    }
    
    // Generates a list of numbers for the dropdown menu with values from 1 - 10 that affects the selected quantity 
    const numberOptions = Array.from({length: 10}, (_, index) => index + 1);

    const handleQuantityChange = async (e) => {
        let newQuantity = parseInt(e.target.value);
        setQuantity(newQuantity);
        product.quantity = newQuantity;
        const res = await fetch("/api/cart/updateproductquantity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user._id,
                productId: product.productId._id,
                quantity: newQuantity
            })
        });
        //setCart(data);
        console.log("Product quantity = ", newQuantity);
    }

    return (
        <Card style={{ width: 'auto' }}>
            <Card.Img style={{maxHeight: '400px'}} variant="top" src={product.productId?.image? product.productId?.image : "https://images.pexels.com/photos/19644201/pexels-photo-19644201/free-photo-of-close-up-of-a-jar-of-cream.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}/>
            <Card.Body>
                <Card.Title>{product.productId?.name? product.productId?.name : "N/A"}</Card.Title>
                <Card.Text className='spaced-apart'>
                    Quantity:
                    <select value={quantity} onChange={handleQuantityChange} style={{height : '25px'}}>
                        {numberOptions.map((number) => (
                            <option key={number} value={number}>
                                {number}
                            </option>
                        ))}
                    </select>
                    {product.productId?.price? "Price: " + formatPrice(product.productId?.price * quantity) : "$0 "}&nbsp;
                    <Button onClick={removeFromCart} variant="outline-danger"><Image src="/assets/trash.png" rounded alt="Delete icon" /></Button>
                </Card.Text>
            </Card.Body>
        </Card>
    );
}