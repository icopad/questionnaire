const fs = require("fs");
const path = require("path");
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

const data = require("./src/data.json");
const db = require("./src/" + data.database);


fastify.get("/", async (request, reply) => {
  let params = {};

  const options = await db.getOptions();
  if (options) {
    params.choiceText = options.map(choice => choice.text);
  }
  else params.error = data.errorMessage;

  //   // Check in case the data is empty or not setup yet
  //   if (options && params.optionNames.length < 1)
  //     params.setup = data.setupMessage;

  // ADD PARAMS FROM TODO HERE

  // Send the page options or raw JSON data if the client requested it
  request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);
});


fastify.post("/", async (request, reply) => {
  // We only send seo if the client is requesting the front-end ui
  let params = {};
  // params.results = true;
  let options;

  // We have a vote - send to the db helper to process and return results

  options = await db.getChoices();
  if (options) {
    params.choiceText = options.map(choice => choice.text);
  }
  params.error = options ? null : data.errorMessage;

  // Return the info to the client
  request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);
});

/**
 * Admin endpoint returns log of votes
 *
 * Send raw json or the admin handlebars page
 */
fastify.get("/admin", async (request, reply) => {
  
  let params = {};
  params.admin = true;
  
  const options = await db.getOptions();
  if (options) {
    params.choiceText = options.map(choice => choice.text);
  }
  else params.error = data.errorMessage;
  
  request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);
});

fastify.post("/reset", async (request, reply) => {
  let params = {};

  /* 
  Authenticate the user request by checking against the env key variable
  - make sure we have a key in the env and body, and that they match
  */
  if (
    !request.body.key ||
    request.body.key.length < 1 ||
    !process.env.ADMIN_KEY ||
    request.body.key !== process.env.ADMIN_KEY
  ) {
    console.error("Auth fail");

    // Auth failed, return the log data plus a failed flag
    params.failed = "You entered invalid credentials!";

    // Get the log list
    // params.optionHistory = await db.getLogs();
  } else {
    // We have a valid key and can clear the log
    // params.optionHistory = await db.clearHistory();
    // Check for errors - method would return false value
    // params.error = params.optionHistory ? null : data.errorMessage;
  }

  // Send a 401 if auth failed, 200 otherwise
  const status = params.failed ? 401 : 200;
  // Send an unauthorized status code if the user credentials failed
  request.query.raw
    ? reply.status(status).send(params)
    : reply.status(status).view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
