const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

// Motor de vistas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Para leer datos de formularios (POST)
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use(express.static(path.join(__dirname, "public")));

// leer y escribir cookies (req.cookies, res.cookie())
app.use(cookieParser());

// Sessions
app.use(
  session({
    secret: "suenos-valenti-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Sueños Valenti server is running");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
