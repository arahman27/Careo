import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OrderConfirmation(){
    const router = useRouter();
    return (<>        
        <div style={{textAlign:"center", paddingTop:"10px"}} id="hero-text">
            <h1>Thank you!</h1>
        </div>
        <div className='centered' style={{paddingTop: '10px', flexDirection: 'column'}}>
            <p><b>Order ID</b>: {router.query.orderId}</p>
            <br/>
            <p>
                You can check your order status <Link href="/orders">here</Link>.
            </p>
        </div>
    </>);
};
