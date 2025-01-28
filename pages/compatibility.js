import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css';
import Image from "next/image";

import cartIcon from "@/public/assets/add_shopping_cart.svg";
import { userAtom, cartItemsAtom } from "@/store";
import { useAtom, useAtomValue } from "jotai";

export default function Compatibility(){
  const [allproducts, setAllProducts] = useState();
	const [searchItem, setSearchItem] = useState();
	const [filteredProducts, setFilteredProducts] = useState();
	const [compatibleProducts, setCompatibleProducts] = useState([]);
	const user = useAtomValue(userAtom);
	const [cartItems, setCartItems] = useAtom(cartItemsAtom);

	useEffect(() => {
			if (!allproducts) {
					fetch("/api/product/getallproducts").then(res => res.json()).then(data => {
							setAllProducts(data);

					});
			}

	}, [allproducts]);

	useEffect(() =>{}, [compatibleProducts]);

	const handleInputChange = (e) => {
		const searchProduct = e.target.value;
		setSearchItem(searchProduct);

		if (searchProduct == ""){
			setFilteredProducts([]);

		}
		else{
			const filteredItems = allproducts.filter((p) =>
				p.name.toLowerCase().startsWith(searchProduct.toLowerCase())
			);

			setFilteredProducts(filteredItems);
		}
	}

	//onSearch will hand the request to get compatible products by sending either id or the name, need to decide later
	const onSearch = async (e) => {
		let product;
		let compatibleproducts = [];

		// Get the selected product
		for (let i = 0; i < allproducts.length; i++) {
			allproducts[i].ingredients = new Set(allproducts[i].ingredients);
			if (allproducts[i].name.toLowerCase().localeCompare(searchItem.toLowerCase()) === 0) {
				product = allproducts[i];
			}
		}

		try {
			const res = await fetch(`/api/product/getProductIncompatibilities?productId=${product._id}`);
			const results = await res.json();
			product.incompatibilities = new Set(results);

			compatibleproducts = allproducts.filter((prod) => {
				for (const ingredient of prod.ingredients.keys()) {
					if (product.incompatibilities.has(ingredient)){
						return false;
					}
				}
				return true;
			});
		} catch (e) {
			console.error(e.message);
		}

		setCompatibleProducts(compatibleproducts);
	}

	const handleProductSelect = (productName) => {
		setSearchItem(productName);
		setFilteredProducts([]);
	
	}

	// Add a product to cart
	async function addToCart (productId) {
		try {
			const res = await fetch("/api/cart/addtocart", {
				method: "POST",
				headers: {
						"Content-Type": "application/json"
				},
				body: JSON.stringify({
						userId: user._id,
						productId: productId,
						quantity: 1
				})
			});
	
			const data = await res.json();
			setCartItems(data.items);

			// TODO: make the button pretty? Turn green maybe?
		} catch(e) {
			console.log(e.message);
		}
		
	}

	return(
		<>
			<h2 id="hero-text">Product Compatibility</h2>
			<h5 style={{textAlign:"center"}}>Search a product name to check compatibility with other products</h5>
			<br></br>
			<div>
				<div className="centered">
					<input
						style={{width: "50%"}}
						type="text"
						value={searchItem}
						onChange={handleInputChange}	
						placeholder="Enter product name"
					/>
					<button onClick={() => onSearch(searchItem)}>Search</button>
				</div>
				<div className="centered">
					<table id="rec-table" style={{width:"50%"}}>
						<tbody>
							{filteredProducts && filteredProducts.map(p => 
								<tr onClick={() => handleProductSelect(p.name)} key={p._id}>
									<td>{p.name}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			<div className="centered">
				<table id="rec-table" style={{width:"60%", margin:"1rem"}}>
					{compatibleProducts.length === 0 && <tbody>
						<tr style={{background:'white'}}>
							<th className="centered">Compatible Products</th>
						</tr>
						<tr>
							<td>Product A</td>
						</tr>
						<tr>
							<td>Product B</td>
						</tr>
						<tr>
							<td>Product C</td>
						</tr>
					</tbody> }
					{compatibleProducts.length > 0 && <tbody>
						<tr style={{background:'white'}}>
							<th className="centered">Compatible Products</th>	
						</tr>	
						{compatibleProducts.map(p => 
								<tr key={p._id}>
									<td><div>{p.name + " | $" + p.price}</div><Button id={`${p._id}`} onClick={() => addToCart(p._id)}><Image src={cartIcon} alt="Add to Cart"></Image></Button></td>
								</tr>
						)}
					</tbody>}
				</table>
			</div>


		</>
	)
}