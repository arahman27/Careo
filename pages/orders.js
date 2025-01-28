import { useEffect } from 'react';
import {atom, useAtomValue, useAtom} from 'jotai';
import { userAtom } from '@/store';
const ordersAtom = atom([]);

const OrdersPage = () => {
    const user = useAtomValue(userAtom);
    const [orders, setOrders] = useAtom(ordersAtom);


    // TODO: Fetch only a specified number of orders, and either fetch more as user scrolls or separate into pages
    // get orders from /api/order/getuserorders?userId=#
    useEffect(() => {
        console.log(user._id);
        const userId = user._id;
        fetch(`/api/order/getuserorders?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.status && data.status != 200) return;
            data = data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
            data.forEach((order) => {
                order.shipping_address = order.shipping_address.address + ", " + order.shipping_address.city + ", " + order.shipping_address.province + " " + order.shipping_address.postal_code;
                order.billing_address = order.billing_address.address + ", " + order.billing_address.city + ", " + order.billing_address.province + " " + order.billing_address.postal_code;
                order.order_date = new Date(order.order_date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
                order.status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                if (order.payment_method === 'creditCard') order.payment_method = 'Credit Card';
                else if (order.payment_method === 'paypal') order.payment_method = 'PayPal';
                order.items.forEach((item) => {
                    if (item.quantity > 1) item.productId.name += " (x" + item.quantity + ")";
                });
            });
            setOrders(data)
        });
    }, [user]);

    return (<>        
		<div style={{textAlign:"center", paddingTop:"10px"}} id="hero-text">
            <h3>Order History</h3>
        </div>
        <div style={{flowDirection:"column"}}className="centered">
            <ul id="order-history-list">
                {orders && orders?.length > 0 && orders.map((order) => (
                    <div key={order._id} class="order-box">
                        <p><b>Order ID:</b> {order._id}</p>
                        <p><b>Date:</b> {order.order_date}</p>
                        <p><b>Total:</b> ${order.total}</p>
                        <p><b>Shipping Address:</b> {order.shipping_address}</p>
                        <p><b>Billing Address:</b> {order.billing_address}</p>
                        <p><b>Payment Method:</b> {order.payment_method}</p>
                        <p><b>Status:</b> {order.status}</p>
                        <p><b>Items:</b></p>
                        <ul>
                            {order.items.map((item) => (
                                <li key={item.productId._id}>{item.productId.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </ul>
        </div>
    </>);
};

export default OrdersPage;