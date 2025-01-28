import { Button, Card, Modal } from "react-bootstrap"
import { useRouter } from "next/router";
import { atom, useAtom, useAtomValue } from "jotai";
import Image from 'next/image';
import { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { addSavedLists } from "@/lib/addSavedList";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { userAtom, cartItemsAtom } from "@/store";
import { formatPrice } from "@/lib/utils";

export default function Recommendation(){
    const router = useRouter();
    const user = useAtomValue(userAtom);
    const [recs, setRecs] = useState();
    const [selectedProduct, setSelectedProduct] = useState({});
    const [cartItems, setCartItems] = useAtom(cartItemsAtom);
    
    useEffect(() => {
        if (!recs) {
            fetch("/api/recommendations/getrecommendations").then(res => res.json()).then(data => {
                setRecs(data);
            });
        }

        if (recs && recs[0])
            setSelectedProduct(recs[0]);
    }, [recs]);

    function selectRec(e){
        setSelectedProduct(recs[e.currentTarget.rowIndex]);
    }

    const saveCurrList = async () => {
        if(recs && recs[0]) {
            addSavedLists(recs);       

            confirmAlert({
                title: 'Current Recommendation List Saved!',
                buttons: [
                    {
                        label: 'Ok',
                    },
                ]
            });
        }
    }

    const loadSavedList = () => {      
        let viewList = fetch("/api/recommendations/getsavedlist").then(res => res.json()).then(data => {
            if(data.savedLists != undefined){
                if(data.savedLists.length > 0) {
                    const reccLists = [];
                    for (let i = 0; i < data.savedLists.length; i++){
                        reccLists.push("Saved list " + (i + 1));

                    }

                    confirmAlert({
                        customUI: ({ onClose }) => {
                            return (
                                <div className='custom-ui'>
                                    <h4>Please select a saved list to load:</h4>
                                    <table id="rec-table">
                                        <tbody>
                                            {reccLists.map((rec, i) => (
                                                <tr onClick={() => {setRecs(data.savedLists[i].savedRecc); onClose();}} key={i}>
                                                    <td><p>Saved list {i + 1}</p></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }
                    });
                }
            }
            else{
                confirmAlert({
                    title: 'No saved list found!',
                    message: 'Please save recommendation list to load them.',
                    buttons: [
                        {
                            label: 'Ok',
                        },
                    ]
                });
            }
        });
    }

    function formatPrice(price){
        return Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(price);
    }

    function addSelectedProductToCart(){
        if (selectedProduct?._id == null) return;

        fetch("/api/cart/addtocart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user._id,
                productId: selectedProduct._id,
                quantity: 1
            })
        }).then(res => res.json()).then(data => {
            setCartItems(data.items);
            let button = document.getElementById("add-to-cart-button")
            button.innerText = "✔";
            button.style.backgroundColor = "green"; // why is this not working

            setTimeout(() => {
                button.innerText = "Add to Cart";
                button.style.backgroundColor = "";
            }, 1000);
        });
    }

    /* TODO: The selected product box (rec-selected-box) still needs a section for ingredients and will have to be modified when the actual recommendation system is implemented */
    return (
        <>
            <h1 style={{textAlign:"center"}} id="hero-text">Recommendations</h1><br/>
            <div>
                <div className='centered' style={{flexDirection:"column"}}>
                    <p>Product recommendations are based on Care Profile conditions</p>                    
                    
                    <div id="recommendation-box">
                        { recs && recs.length > 0 ? 
                        <table id="rec-table">
                            <tbody>
                                {recs.map((rec, i) => (
                                    <tr onClick={selectRec} key={i} className={(rec._id == selectedProduct._id) ? "rec-selected" : null}>
                                        <td><p>{rec.name}</p><p>{formatPrice(rec.price)}</p></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table> :
                        <div className="loading">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>}
                    </div>
                    <br/>
                    <div className="button-menu">
                        <Button variant="primary" className="centered" onClick={saveCurrList}>Save List</Button>
                        <Button variant="secondary" className="centered" onClick={loadSavedList}>Load List</Button>
                    </div>
                    <div id="rec-selected-box">
                        { selectedProduct && selectedProduct.name ?
                            <Row>
                                <Row>
                                    <Col>
                                        <Row>
                                            <Image width={128} height={128} src={selectedProduct.image} alt="product image" />
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row style={{flexWrap:"wrap"}}>
                                            <h5>{selectedProduct.name}</h5>
                                            <p>{formatPrice(selectedProduct.price)}</p>
                                        </Row>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <h6><b>Product Info</b></h6>             
                                    <div id="rec-selected-info">
                                        <span>
                                            <b>Brand:</b> {selectedProduct.brand}
                                        </span>                                            
                                        <span>
                                            <b>Category:</b> {selectedProduct.type}
                                        </span>
                                        <span>
                                            <b>Vegan:</b> {selectedProduct.is_vegan ? "✔" : "✘"}
                                        </span>
                                        <span>
                                            <b>Cruelty Free:</b> {selectedProduct.is_cruelty_free ? "✔" : "✘"}
                                        </span>
                                    </div>
                                </Row>
                            </Row> : <p>Nothing selected.</p>}
                    </div>          
                    <Button style={{marginTop:'1rem'}}id="add-to-cart-button" variant="primary" onClick={addSelectedProductToCart} className="centered" type="submit">Add to Cart</Button>
                </div>
            </div>
        </>
    );
}