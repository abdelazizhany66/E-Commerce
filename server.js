const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");

const dbconnection = require("./config/database");
const APIError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const mountRoute = require("./routes");
const { webhochCheckout } = require("./controllers/orderController");

dotenv.config({ path: "./.env" });
// connect DB
dbconnection();

//Express App
const app = express({ limit: "20kb" });
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

//security
//clean up a ttack query nosql in body or params such as {$gt:''} before validation
app.use(mongoSanitize());
// convert code html to word before validation
app.use(xss());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

app.use("/api/forgotpassword", apiLimiter);

app.use(hpp({ whitelist: ["price", "sold", "ratingQuantity", "quantity"] }));

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
