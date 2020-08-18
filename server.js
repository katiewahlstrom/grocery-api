const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dataAccessLayer = require("./dataAccessLayer");
const { ObjectId, ObjectID } = require("mongodb");

dataAccessLayer.connect();

//creating my Server
const app = express();

//installing the CORS middleward
//allows us (the server) to respond to
//requests from a different origin (URL)
//that the server.
app.use(cors());
//installing the body-parser
//allow us to read JSON from requests
app.use(bodyParser.json());

//read in JSON file (mock database)

//defining our HTTP resourse methods
//endpoints
//routes

//GET ALL PRODUCTS
//GET /api/products
app.get("/api/products", async (request, response) => {
  const products = await dataAccessLayer.findAll();

  response.send(products);
});

//GET A SPECIFIC PRODUCT BY ID
//GET /api/products/:id

app.get("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }
  const productQuery = {
    _id: new ObjectId(productId),
  };
  let product;

  try {
    product = await dataAccessLayer.findOne(productQuery);
  } catch (error) {
    response.status(404).send(`product with id ${productId} not found`);
    return;
  }
  response.send(product);
});

//CREATE A NEW PRODUCT
//POST /api/products { id: 123, name "apples", price: 1.99  }

app.post("/api/products", async (request, response) => {
  //read the json body from the request
  const body = request.body;

  //validate the json body to have the required properties
  /* Required Properties: 
    -name
    -price
    -category
    */
  if (!body.name || !body.price || !body.category) {
    response
      .status(400)
      .send("Bad Request. Validation Error.  Missing name, price or category!");
    return;
  }

  //Validate data types of properties
  // name => non-empty string
  //price => Greter than 0 Number
  //category => non-empty string

  if (body.name && typeof body.name !== "string") {
    response.status(400).send("The name parameter muct be of type string.");
    return;
  }
  if (body.category && typeof body.category !== "string") {
    response.status(400).send("The category parameter muct be of type string.");
    return;
  }

  if (body.price && isNaN(Number(body.price))) {
    response
      .status(400)
      .send("The price parameter must be of type price and greater than 0.");
    return;
  }
  let myResponse = await dataAccessLayer.insertOne(body);

  response.status(201).send(myResponse.ops);
});

//UPDATE EXISTING PRODUCT BY ID
// PUT /api/products { id: 123, name "apples", price: 4.99  }

app.put("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  const body = request.body;

  if (!ObjectId.isValid(productId)) {
    console.log("PUT product Id", !ObjectID.isValid(productId));
    response.status(400).send(`ProductId ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  let result = await dataAccessLayer.updateOne(productQuery, body);
  console.log("working", result);
  response.send(result);

  // DELETE EXISTING PRODUCT BY ID
  //DELETE /api/products/:id
});

app.delete("/api/products/:id", async (request, response) => {
  const productId = request.params.id;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };
  try {
    await dataAccessLayer.deleteOne(productQuery);
  } catch (error) {
    response.status(404).send(`product with id ${productId} not found`);
    return;
  }

  response.send();
});

//starting my server
const port = process.env.PORT ? process.env.PORT : 3005;
app.listen(port, () => {
  console.log("grocery API Server Started!");
});
