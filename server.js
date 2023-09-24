const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

const dbconnection = require("./config/database");
const APIError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const mountRoute = require("./routes");
const { webhochCheckout } = require("./controllers/orderController");

dotenv.config({ path: "./.env" });
// connect DB
dbconnection();

//Express App
const app = express();
app.use(cors());
app.use(compression());

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhochCheckout
);

//Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_ENV}`);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

//Mount Routes
mountRoute(app);

app.all("*", (req, res, next) => {
  next(new APIError(`Can't find ${req.originalUrl} on this server!`, 400));
});

app.use(globalError);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log("app running");
});

process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error ${err.name} | ${err.message} `);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
