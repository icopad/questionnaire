const fs = require("fs");
const path = require("path");
const fastify = require("fastify")({
  logger: false
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

const data = require("./src/data.json");
const db = require("./src/" + data.database);


fastify.get("/", async (request, reply) => {
  let params = {};

  const options = await db.getChoices();
  if (options) {
    params.choiceText = options.map(choice => choice.text);
  }
  else params.error = data.errorMessage;

  // Send the page options or raw JSON data if the client requested it
  request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);
});


fastify.post("/add", async (request, reply) => {
  
  let params = {};
  params.results = true;
  
  let options;
  
  if(request.body && request.body.text) {
    // console.log(request.body.text);
    params.addResult = await db.addQuestion(request.body.text);
    console.log(params.addResult);
    
  }
  // if(request.body.key) {
  //   console.log(request.body.key)
  // }
  console.log(params.failed);
  const status = params.failed ? 401 : 200;
  reply.status(status).send(params);
});


fastify.get("/admin", async (request, reply) => {
  
  let params = {};
  params.admin = true;
  
  const options = await db.getChoices();
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
  params.deleteResult = await db.clearHistory();

  // Check for errors - method would return false value
  params.error = params.deleteResult ? null : data.errorMessage;
  
  const status = params.failed ? 401 : 200;
  reply.status(status).send(params);
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
