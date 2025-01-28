import { getConditionByName } from "./models/condition";
import { getIncompatibilitiesByIngredientId } from "./models/incompatible";

const { getAllProducts, getAllProductsVegan, getAllProductsCrueltyFree, getAllProductsVeganAndCrueltyFree } = require("./models/product");

// Receives a user profile as a javascript object, returns null in case of error
async function recommend(profile) {
  console.log("Recommendation profile: " + JSON.stringify(profile));
  try {
    let recommendation = {};

    let products;
    if (profile.vegan && profile.crueltyFree) {
      products = await getAllProductsVeganAndCrueltyFree();
    } else if(profile.vegan) {
      products = await getAllProductsVegan();
    } else if(profile.crueltyFree) {
      products = await getAllProductsCrueltyFree();
    } else {
      products = await getAllProducts();
    }

    console.log("Retrieved " + products.length + " products.");

    for (let i = 0; i < products.length; i++) {
      products[i].incompatibilities = new Set();
      // set up ingredient incompatibilities
      for (let j = 0; j < products[i].ingredients.length; j++) {
        try {
          const incompats = await getIncompatibilitiesByIngredientId(products[i].ingredients[j]);
          if (incompats) {
            // Incompatibilities can be a set
            incompats.forEach(incompat => products[i].incompatibilities.add(incompat));
          }
        } catch (err) {
          // console.log("Could not find incompats for ingredient ID: " + products[i].ingredients[j]);
        }
      }
      // Convert product ingredients to Set for faster operations from this point on
      products[i].ingredients = new Set(products[i].ingredients);
    }

    
   

    // Build a Set of product types, Set because each element should be unique and this saves time on unique checks
    // TODO: look into allowing querying of this instead depending on processing vs. querying time
    // TODO: Tailor the types of product needed based on age and conditions
    let productTypes = new Set();
    for (let i = 0; i < products.length; i++) {
      productTypes.add(products[i].type);
    }

    // Tracks which ingredient incompatibilities have already been filtered out.
    let filtered = new Set();

    // if conditions isn't empty, get condition details
    if (profile.conditions && profile.conditions.length > 0) {
      const conditions = [];
      for (let i = 0; i < profile.conditions.length; i++) {
        conditions.push(await getConditionByName(profile.conditions[i]));
      }

      // good ingredient dictionary, has ingredient name as the key and the number of conditions the ingredient helps as the value.
      let goodIngredients = {};

      // build value table here while sorting through conditions to build the lists of good and bad ingredients
      for (let i = 0; i < conditions.length; i++) {
        for (let j = 0; j < conditions[i].good_ingredient_id.length; j++) {
          if (goodIngredients[conditions[i].good_ingredient_id[j]]) {
            goodIngredients[conditions[i].good_ingredient_id[j]] += 1;
          } else {
            goodIngredients[conditions[i].good_ingredient_id[j]] = 1;
          }
        }
      }

      // badIngredients is a Set for faster operations
      const badIngredients = new Set();
      for (let i = 0; i < conditions.length; i++) {
        for (let j = 0; j < conditions[i].bad_ingredient_id.length; j++) {
          badIngredients.add(conditions[i].bad_ingredient_id[j]);
        }
      }

      // console.log("Products before badIngredients: " + products.length);
      
      if (badIngredients.size > 0) {
        // Filter out products by bad ingredients
        for (const ingredient of badIngredients.keys()) {
          products = products.filter((product) => {
            return !product.ingredients.has(ingredient);
          });
        }
      }

      // console.log("Products after badIngredients: " + products.length);

      // for (let i = 0; i < products.length; i++) {
      //   console.log(JSON.stringify(products[i]));
      // }
      
      if (goodIngredients) {
        // Add value to products based on the valuetable and their ingredients
        // TOOD: build max heap instead for more efficient extraction? might have to revisit for budget balancing later, look into potential data structures
        for (let i = 0; i < products.length; i++) {
          products[i].value = 0;
          for (const ingredient of products[i].ingredients.keys()) {
            if (goodIngredients[ingredient]) {
              products[i].value += goodIngredients[ingredient];
            }
          }
        }

        // TODO: Check for sponsored status. Add sponsored as a key to the Product type? 

        // Sort the products by value descending and cost ascending.
        products.sort((a, b) => {
          return (b.value - a.value || a.price - b.price);
        });

        // add the highest rated product first
        recommendation[products[0].type] = products[0];

        // Tracks the last product added
        let lastProduct = products[0];

        // Now for the fun loop where we do the rest of the actual work
        // Exits when the recommendation has every type of product in it
        while(!(Object.keys(recommendation).length === productTypes.size)) {
          // Filter out products based on type
          products = products.filter((product) => !(product.type == lastProduct.type));

          // Filter out products based on incompatible ingredients from the previously added ingredient
          // Sets speed this up a bit
          if (lastProduct.incompatibilities) {
            let skip = true;
            for (const incompat of lastProduct.incompatibilities) {
              if (!filtered.has(incompat)){
                // console.log("NO SKIP!");
                skip = false;
                filtered.add(incompat);
              }              
            }
            if (!skip) {
              products = products.filter((product) => {
                for (const ingredient of product.ingredients.keys()) {
                  if (lastProduct.incompatibilities.has(ingredient)){
                    return false;
                  }
                }
                return true;
              });
            }
          }

          // console.log("Products after incompat filter: " + products.length);

          // OOPS no products left that work.
          if (products.length == 0) {
            console.log("OUT OF PRODUCTS");
            break;
            // TODO: Start from scratch again? Maybe work with a copy of the original product array and
            // get rid of the top product before restarting the process in this loop.
          }

          // Add the next best product of a different type
          recommendation[products[0].type] = products[0];
          lastProduct = products[0];
        }

        // ayy lookit that we got the recommendation list
      }
    }
    else {
      // In case they have no conditions.

      // Sort by price, randomize product list to ensure different results if the user has no conditions
      products.sort((a, b) => a.price - b.price || Math.random() - 0.5);

      // Same logic as above with the while loop, taking the top product, and filtering out incompatible products
      recommendation[products[0].type] = products[0];

      let lastProduct = products[0];

      // Add new products to recommendation until out of products, or all product types filled.
      while (!(Object.keys(recommendation).length === productTypes.size)) {
        // Filter out products based on type
        products = products.filter((product) => !(product.type == lastProduct.type));

        // console.log("Products before incompat filter: " + products.length);

        // Filter out products based on incompatible ingredients from the previously added ingredient
        // NOTE: again, product.incompatible does not exist, need to figure out how the data fits together in the DB to shape the model
        if (lastProduct.incompatibilities) {
          let skip = true;
          for (const incompat of lastProduct.incompatibilities) {
            if (!filtered.has(incompat)){
              // console.log("NO SKIP!");
              skip = false;
              filtered.add(incompat);
            }              
          }
          if (!skip) {
            products = products.filter((product) => {
              for (const ingredient of product.ingredients.keys()) {
                if (lastProduct.incompatibilities.has(ingredient)){
                  return false;
                }
              }
              return true;
            });
          }
        }
        
        // console.log("Products after incompat filter: " + products.length);

        // OOPS no products left that work.
        if (products.length == 0) {
          break;
        }

        // Add the next best product of a different type
        recommendation[products[0].type] = products[0];
        lastProduct = products[0];
      }
    }

    // Budget management
    if (profile.useBudget) {
      console.log("Optimizing budget..");
      let totalCost = Object.values(recommendation).reduce((a, b) => a + b.price, 0);

      // Sort cost descending
      let sortedByCost = [...Object.values(recommendation)];
      sortedByCost.sort((a, b) => b.price - a.price);

      // Remove the most expensive item while the budget is over
      while (totalCost > profile.budget) {
        delete recommendation[sortedByCost[0].type];
        sortedByCost.shift();
        totalCost = Object.values(recommendation).reduce((a, b) => a + b.price, 0);
      }
    }

    console.log("finished recommendations");
    return Object.values(recommendation);     // Return only the actual products

  } catch(err) {
    console.error(err.message);
    return null;
  }
  
}

export { recommend }