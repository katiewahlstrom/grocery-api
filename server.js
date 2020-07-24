const express = require("express");
const bodyParser = require("body-parser");
fs = require("fs");

//creating my Server
const app = express();

//installing the body-parser middleware
//allow us to read JSON from requests
app.use(bodyParser.json());

//read in JSON file (mock database)
let products = [];

try {
  products = JSON.parse(fs.readFileSync("products.json")).products;
} catch (error) {
  console.log("No existing file.");
}

console.log(products);

//defining our HTTP resourse methods
//endpoints
//routes

//GET ALL PRODUCTS
//GET /api/products
app.get("/api/products", (request, response) => {
  response.send(products);
});

//GET A SPECIFIC PRODUCT BY ID
//GET /api/products/:id

app.get("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const product = products.find((p) => {
    if (productId === p.id) {
      return true;
    }
  });

  if (!product) {
    response.send(`product with id ${productId} not found!`);
    return;
  }

  response.send(product);
});

//CREATE A NEW PRODUCT
//POST /api/products { id: 123, name "apples", price: 1.99  }

app.post("/api/products", (request, response) => {
  //read the json body from the request
  const body = request.body;
  console.log(body);
  //validate the json body to have the required properties
  /* Required Properties: 
    -id
    -name
    -price
    */
  if (!body.id || !body.name || !body.price) {
    response.send("Bad Request. Validation Error.  Missing id, name or price");
    return;
  }
  // Add the new product to our existing products array
  products.push(body);

  //commit the new products array to the database (json file)

  const jsonPayload = {
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(jsonPayload));

  response.send();
});

//UPDATE EXISTING PRODUCT BY ID
// PUT /api/products { id: 123, name "apples", price: 4.99  }

app.put("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const product = products.find((p) => {
    return productId === p.id;
  });
  if (!product) {
    response.send(`Product with id ${productId} not found!`);
    return;
  }

  const body = request.body;

  if (body.name) {
    product.name = body.name;
  }

  if (body.price) {
    product.price = body.price;
  }

  // DELETE EXISTING PRODUCT BY ID
  //DELETE /api/products/:id
});

app.delete("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const productIndex = products.findIndex((p) => {
    return productId === p.id;
  });

  if (productIndex === -1) {
    response.sendStatus(`product with ID ${productId} not found!`);
  }

  products.splice(productIndex, 1);

  const jsonPayload = {
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(jsonPayload));

  response.send();
});

//starting my server
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
  console.log("grocery API Server Started!");
});
