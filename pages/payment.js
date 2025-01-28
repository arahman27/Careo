import { Form, Button, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";

import { atom, useAtom, useAtomValue } from "jotai";
import { orderInfoAtom, userAtom, cartItemsAtom } from "@/store";
import { use, useEffect } from "react";

import { Order } from "@/lib/models/order";
import { Address } from "@/lib/models/address";
import { get } from "mongoose";

import { formatPrice } from "@/lib/utils";

const paymentAtom = atom("creditCard");
const billingAddressAtom = atom(true);

export default function PlaceOrder() {
    const orderInfo = useAtomValue(orderInfoAtom);
    const user = useAtomValue(userAtom);
    const [cartItems, setCartItems] = useAtom(cartItemsAtom);

    const [billingAddressSame, setBillingAddressSame] = useAtom(billingAddressAtom);
    const [paymentMethod, setPaymentMethod] = useAtom(paymentAtom);

    const router = useRouter();
    
    if (!orderInfo || !orderInfo.firstName) { // If shipping info has been lost due to refresh or direct navigation
        if (typeof window !== "undefined") { // Ensure we're on the client side
            router.push('/place-order');
        }
    }

    function toggleBillingAddress(e) {
        setBillingAddressSame(e.target.checked);
    }

    function changePaymentMethod(e) {
        setPaymentMethod(e.target.name);
    }

    function validateCreditCard(cardNumber, expiryDate, securityCode) {
        // Remove spaces from card number, and slashes from expiry date
        cardNumber = cardNumber.replace(' ', '');

        // Check for invalid characters
        if (parseInt(cardNumber) == NaN || parseInt(securityCode) == NaN || parseInt(expiryDate.replace('/', '')) == NaN) {
            console.log("not a number");
            return false;
        }

        // Check length of expirydate and securitycode
        if (expiryDate.length !== 5 || securityCode.length < 3 || securityCode.length > 4) {
            console.log("length wrong");
            return false;
        }

        // Split into array of numbers for luhn's algorithm
        let cardNumberArray = cardNumber.split('').map(number =>  parseInt(number));

        // luhn's algorithm

        // Double every other number, add its digits if it becomes larger than 9
        for (let i = cardNumberArray.length - 1; i >= 0; i -= 2) {
            cardNumberArray[i] *= 2;
            if (cardNumberArray[i] > 9) {
                cardNumberArray[i] = (cardNumberArray[i] % 10) + 1
            }
        }

        // Sum numbers in array, if sum % 10 != 0 the card number is invalid
        const sum = cardNumberArray.reduce((s, current) => s + current, 0);

        if (sum % 10 !== 0) {
            console.log("sum wrong");
            return false;
        }

        // TODO: implement this 
        return true;
    }

    function getCartItems() {
        return fetch("/api/cart/getcart?userId=" + user._id)
        .then(res => res.json())
        .then(data => {
            return data.items;
        });
    }

    function getSubtotal() {
        let subtotal = 0;
        for (let i = 0; i < cartItems.length; i++) {
            subtotal += cartItems[i].productId.price * cartItems[i].quantity;
        }
        return subtotal;
    }

    function submit(e) {
        e.preventDefault();

        let form = document.getElementById("payment-info-form");
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (paymentMethod === "paypal") {
            // TODO: implement PayPal payment
        } else if (paymentMethod === "creditCard") {
            console.log(form);
            let creditCard = {
                cardNumber: form[3].value,
                expiryDate: form[4].value,
                securityCode: form[5].value
            };

            if (!validateCreditCard(creditCard.cardNumber, creditCard.expiryDate, creditCard.securityCode)) {
                alert("Invalid credit card information");
                return;
            }
            
            let shipping = {
                first_name: orderInfo.firstName,
                last_name: orderInfo.lastName,
                address: orderInfo.address,
                apartment: orderInfo.apartment,
                city: orderInfo.city,
                province: orderInfo.province,
                country: orderInfo.country,
                postal_code: orderInfo.postalCode
            }

            let billing = null;
            if (billingAddressSame) {
                billing = shipping;
            } else {
                billing = {
                    first_name: form[0].value,
                    last_name: form[1].value,
                    address: form[2].value,
                    apartment: form[3].value,
                    city: form[7].value,
                    province: form[8].value,
                    country: form[9].value,
                    postal_code: form[10].value
                };
            }

            let shippingAddress = new Address(shipping);
            let billingAddress = new Address(billing);

            fetch("/api/order/placeorder", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user._id,
                    shipping_address: shippingAddress,
                    billing_address: billingAddress,
                    payment_method: paymentMethod
                })
            }).then(res => res.json()).then(data => {
                if (data.status === 'processing') {
                    setCartItems([]);
                    fetch("/api/cart/emptycart?userId=" + user._id);
                    router.push(`/order-confirmation?orderId=${data._id}`);

                } else {
                    alert("Error placing order: " + data.message);
                }
            });
        }
    }
    
    let subtotal = getSubtotal();
    let shipping = 4.99;
    let tax = (subtotal + shipping) * 0.13;
    let total = subtotal + shipping + tax;

    // TODO: maybe replace 'Credit Card' and 'PayPal' with icons
    return(
		<>
		<div style={{textAlign:"center", paddingTop:"10px"}} id="hero-text">
          <h3>Payment Information</h3>
        </div>
		<div className='centered' style={{paddingTop: '10px', flexDirection: 'column'}}>
            <Form id="payment-info-form">
                <Row className="mb-3">
                    <Form.Group as={Col} >
                        <p>Payment Method</p>
                        <div className="inline-flex">
                            <div className="form-check" style={{marginRight:'10px'}}>
                                <input onChange={changePaymentMethod} className="form-check-input" type="radio" name="creditCard" id="payment-method-credit" checked={paymentMethod==="creditCard"}></input>
                                <label className="form-check-label" for="payment-method-credit">
                                    Credit Card
                                </label>
                            </div>
                            <div className="form-check">
                                <input onChange={changePaymentMethod} className="form-check-input" type="radio" name="paypal" id="payment-method-paypal" checked={paymentMethod==="paypal"}></input>
                                <label className="form-check-label" for="payment-method-paypal">
                                    PayPal
                                </label>
                            </div>
                        </div>
                    </Form.Group>
                </Row>
                {paymentMethod === "creditCard" && <>
                <Row className="mb-3">
                    <Form.Group className="inline-flex">
                        <Form.Check checked={billingAddressSame} onChange={toggleBillingAddress} type="checkbox" id="same-billing-address" name="same-billing-address" value="same-billing-address" style={{marginRight:"10px"}}></Form.Check>
                        <Form.Label>Billing address same as shipping address</Form.Label>
                    </Form.Group>
                </Row>
                {billingAddressSame === false && <div id="billing-address-box">
                    <Row className="mb-3">
					<Form.Group as={Col} >
						<Form.Label>First name</Form.Label>
						<Form.Control type="text" placeholder="John" required></Form.Control>
					</Form.Group>
					<Form.Group as={Col}>
						<Form.Label>Last name</Form.Label>
						<Form.Control type="text" placeholder="Smith" required></Form.Control>
					</Form.Group>
				</Row>
				<Row className="mb-3">
					<Form.Group as={Col}>
						<Form.Label>Address</Form.Label>
						<Form.Control type="text" placeholder="1750 Finch Avenue East" required></Form.Control>
					</Form.Group>
				</Row>
				<Row className="mb-3">
					<Form.Group as={Col}>
						<Form.Label>Apartment, Suite, etc. (optional) </Form.Label>
						<Form.Control type="text" placeholder="Apt. 123"></Form.Control>
					</Form.Group>
				</Row>				
				<Row className="mb-3">
					<Form.Group as={Col}>
						<Form.Label>City</Form.Label>
						<Form.Control type="text" placeholder="Toronto" required></Form.Control>
					</Form.Group>
					<Form.Group as={Col}>
						<Form.Label>Province</Form.Label>
						<Form.Select>
							<option value="AB">AB</option>
							<option value="BC">BC</option>
							<option value="MB">MB</option>
							<option value="NB">NB</option>
							<option value="NL">NL</option>
							<option value="NS">NS</option>
							<option value="ON">ON</option>
							<option value="PE">PE</option>
							<option value="QC">QC</option>
							<option value="SK">SK</option>
						</Form.Select>
					</Form.Group>
				</Row>
				<Row className="mb-3">
					<Form.Group as={Col}>
						<Form.Label>Country</Form.Label>
						<Form.Select>
							<option value="Canada">Canada</option>
						</Form.Select>
					</Form.Group>
				</Row>
				<Row className="mb-3">
					<Form.Group as={Col}>
						<Form.Label>Postal Code</Form.Label>
						<Form.Control type="text" placeholder="M2J 2X5"></Form.Control>
					</Form.Group>
				</Row>
                </div>}
				<Row className="mb-3">
					<Form.Group as={Col} >
						<Form.Label>Card Number</Form.Label>
						<Form.Control type="text" placeholder="123412340987" required></Form.Control>
					</Form.Group>
				</Row>
				<Row className="mb-3">                    
					<Form.Group as={Col}>
						<Form.Label>Expiry Date</Form.Label>
						<Form.Control type="text" placeholder="01/23" required></Form.Control>
					</Form.Group>
					<Form.Group as={Col}>
						<Form.Label>Security Code</Form.Label>
						<Form.Control type="text" placeholder="123" required></Form.Control>
					</Form.Group>
				</Row>
                </>}
                {paymentMethod === "paypal" && <>
                <Row className="mb-3">
                    <h4 style={{border:'2px solid red', borderRadius: '5px',textAlign:'center', padding:'20px'}}>PayPal payment not yet integrated</h4>
                </Row>
                </>}

                <Row>
                    <div id="order-summary">
                        {cartItems.map((item, index) => {
                            return (
                                <div key={index}>
                                    <div><b>{item.productId?.name}</b> x {item.quantity}</div> <span>{formatPrice(item.productId?.price * item.quantity)}</span>
                                </div>
                            );
                        })}
                        <div style={{marginBottom:'20px'}}className="divider"></div>
                        <div><b>Subtotal</b> <span>{formatPrice(subtotal)}</span></div>
                        <div><b>Shipping</b> <span>{formatPrice(shipping)}</span></div>
                        <div><b>Tax</b> <span>{formatPrice(tax)}</span></div>
                        <div><b style={{marginTop:'10px'}}>Total</b> <span><b style={{fontSize:'1.5em'}}>{formatPrice(total)}</b></span></div>
                    </div>
                </Row>


				<Row className="mb-3">
					<Col className="centered">
						<Button style={{width:'250px', height:'75px', fontSize:'1.5em'}} onClick={submit} variant="primary" type="Submit">Place Order</Button>
					</Col>				
				</Row>
			</Form>
		</div>
		</>
	);
}