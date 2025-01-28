import Head from "next/head";
import { useState, useEffect } from "react";
import { useAtom } from 'jotai';
import {Container, Col, Row, Card, Button, FormControl, FormCheck, Form} from "react-bootstrap";
import { Inter } from "next/font/google";

import { conditionsAtom } from "@/store";
import { userAtom } from "@/store";
import { setProfileData } from "@/lib/userData";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

//TODO: Add 

// props.conditions must be an array of strings
export default function CreateProfile(props) {
  const router = useRouter();

  const [conditions, setConditions] = useAtom(conditionsAtom);
  const [user, setUser] = useAtom(userAtom);

  const [listConditions, setListConditions] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  let age = 18;
  let vegan = false;
  let crueltyFree = false;
  let budget = 100;
  let budgetBool = false;

  // Populate the list of conditions
  // setListConditions(props.conditions);
  useEffect(() => {
    if (!conditions || conditions.length === 0) {
      fetch(`/api/data/condition`, {
        method: 'GET',
      })
      .then((response) => response.json())
      .then((data) => {
        let c = [];
        for (let i = 0; i < data?.conditions?.length; i++) {
          c.push(data.conditions[i].name);
        }
        setConditions(c);
      });
    }

    if (!listConditions || (listConditions.length === 0 && selectedConditions.length === 0)) {
      setListConditions(conditions);
    }
  }, [listConditions, conditions, selectedConditions, setConditions]);
  //setListConditions(test_conditions);

  // Array of JSX objects in the list of conditions view
  let list = [];
  for (let i = 0; listConditions && i < listConditions.length; i++) {
    list.push(
      <div key={i}>
        <span style={{display: "flex", justifyContent: "space-between"}}>
          <p>{listConditions[i]}</p>
          <Button variant="success" onClick={() => {addCondition(i)}}>Add</Button>
        </span> 
        <hr />
      </div>
    );
  }

  // Array of JSX objects in the selected conditions view
  let selected = [];
  for (let i = 0; selectedConditions && i < selectedConditions.length; i++) {
    selected.push(
      <div key={i}>
        <span style={{display: "flex", justifyContent: "space-between"}}>
          <p>{selectedConditions[i]}</p>
          <Button variant="outline-danger" onClick={() => {removeCondition(i)}}>X</Button>
        </span> 
        <hr />
      </div>

    );
  }

  // Add new condition to the list of selected conditions
  function addCondition(conditionIndex) {
    if (listConditions.length > 0) {
      setSelectedConditions([listConditions[conditionIndex], ...selectedConditions]);
      let newArr = Array.from(listConditions);
      newArr.splice(conditionIndex, 1);
      setListConditions(newArr);
    }
  }

  // Remove a condition from the selected list
  function removeCondition(conditionIndex) {
    let newArr = Array.from(selectedConditions);
    const con = selectedConditions[conditionIndex];
    newArr.splice(conditionIndex, 1);
    setSelectedConditions(newArr);
    setListConditions([con, ...listConditions]);
  }

  // Budget boolean toggle
  function setBudget(val) {
    budget = isNaN(val) ? budget : parseInt(val);
  }

  // Submit form to back-end, update local atom
  function formSubmit() {
    // Set DB data
    let p = {};
    p.conditions = selectedConditions;
    p.age = age;
    p.budget = budget;
    p.useBudget = budgetBool;
    p.vegan = vegan;
    p.crueltyFree = crueltyFree;
    setProfileData(p);

    // Set atom data
    let u = user;
    u.conditions = p.conditions;
    u.age = p.age;
    u.budget = p.budget;
    u.useBudget = p.useBudget;
    u.vegan = p.vegan;
    u.crueltyFree = p.crueltyFree;
    setUser(u);

    router.push('/user-profile');

  }

  return (
    <>
      <Head>
        <title>Create Care Profile</title>
        <meta name="description" content="Your Self-Care Superhero" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className}`}>
        <div style={{textAlign:"center"}} id="hero-text">
          <h1>Create Care Profile</h1>
          <br />
          <p>Please select your conditions from the list below</p>
        </div>
        <br/>
        <Container fluid style={{marginBottom:"5em"}}>
          <Row style={{minHeight: "25em", marginLeft: "1%", marginRight: "1%"}}>
            <Col className="mx-auto condition-card">
              <Row>
                <Card text="light" className="overflow-auto" style={{minHeight: "25em", maxHeight: "25em", background: "#FFFFFF", padding: "1em"}}> 
                  <Card.Title>All</Card.Title>
                  <hr></hr>
                  {list}
                </Card>
              </Row>
            </Col>
            <Col className="mx-auto condition-card">
              <Row>
                <Card text="light" className="overflow-auto" style={{minHeight: "25em", maxHeight: "25em", background: "#FFFFFF", padding: "1em"}}> 
                  <Card.Title>Selected</Card.Title>
                  <hr></hr>
                  {selected}
                </Card>
              </Row>
            </Col>
          </Row>
          <br /><br />
          <div className="auto-margin profile-input-group">
            <Row className="mx-auto profile-input-section">
                <h5 style={{marginRight: "2em"}}>Your Age: </h5>
                <FormControl type="number" min="18" max="120" defaultValue="18" onChange={(e) => age = e.currentTarget.value}>                
                </FormControl>
            </Row>
            <br />
            <Row className="mx-auto profile-input-section">
                <FormCheck label="Only display vegan products" onChange={() => vegan = !vegan}>
                </FormCheck>
            </Row>
            <br />
            <Row className="mx-auto profile-input-section">
                <FormCheck label="Only display cruelty-free products" onChange={() => crueltyFree = !crueltyFree}>
                </FormCheck>
            </Row>
            <br />
            <Row className="mx-auto profile-input-section">
                <FormCheck label="Set max budget ($)" onChange={() => {
                    budgetBool = !budgetBool
                    document.getElementById("budget").disabled = !budgetBool;
                  }}>
                </FormCheck>
                <Form.Control disabled={true} id="budget" type="number" onChange={(e) => setBudget(e.currentTarget.value)}>
                </Form.Control>
            </Row>
            <br /><br />
            <Row className="mx-auto" style={{maxWidth: "25em"}}>
              <Button onClick={formSubmit}>Create</Button>
            </Row>
          </div>
        </Container>
      </main>
    </>
  );
}