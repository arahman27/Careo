import { Form, Row, Col, Button } from "react-bootstrap";
import { useRouter } from "next/router";

import { useAtom } from "jotai";
import { orderInfoAtom } from "@/store";

export default function PlaceOrder(){
	const router = useRouter();
	const [orderInfo, setOrderInfo] = useAtom(orderInfoAtom);

	function submit(e) {
		e.preventDefault();

		let form = document.getElementById("place-order-form");
		
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		let data = {
			firstName: form[0].value,
			lastName: form[1].value,
			address: form[2].value,
			apartment: form[3].value,
			city: form[4].value,
			province: form[5].value,
			country: form[6].value,
			postalCode: form[7].value
		};
		setOrderInfo(data);
		router.push('/payment');	
	}

	return(
		<>
		<div style={{textAlign:"center", paddingTop:"10px"}} id="hero-text">
          <h3>Place Order</h3>
        </div>
		<div className='centered' style={{paddingTop: '10px'}}>
			<Form id="place-order-form">
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
						<Form.Control type="text" placeholder="M2J 2X5" required></Form.Control>
					</Form.Group>
				</Row>
				<Row className="mb-3">
					<Col>
						<Button onClick={submit} variant="primary" type="Submit">Next: Payment</Button>
					</Col>				
				</Row>
			</Form>
		</div>
		</>
	);
}