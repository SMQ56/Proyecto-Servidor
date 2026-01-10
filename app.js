const express = require("express");
const path = require("path");
const fs = require("fs");
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

// Middleware global: lee la cookie del tema en cada petición
// y la deja disponible para todas las vistas EJS mediante res.locals
app.use((req, res, next) => {
  res.locals.theme = req.cookies.theme || "light";
  next();
});

app.get("/", (req, res) => {
  res.render("index", {
    title: "Sueños Valenti",
    description: "Group sessions to connect with your supra consciousness",
  });
});

app.get("/registro", (req, res) => {
  res.render("registro", {
    errors: [],
    formData: {},
  });
});

app.post("/registro", (req, res) => {
  const { name, email, age, city, interests } = req.body;
  const errors = [];

  if (!name || name.trim() === "") {
    errors.push("Name is required");
  }

  if (!email || !email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (!age || age <= 0) {
    errors.push("Age must be greater than 0");
  }

  if (errors.length > 0) {
    return res.render("registro", {
      errors,
      formData: req.body,
    });
  }

  const newUser = {
    name,
    email,
    age: Number(age),
    city,
    interests: interests ? [].concat(interests) : [],
  };

  const filePath = path.join(__dirname, "data", "usuarios.json");
  const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    formData: {},
  });
});

app.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render("login", {
      error: "Email is required",
      formData: req.body,
    });
  }

  const filePath = path.join(__dirname, "data", "usuarios.json");
  const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.render("login", {
      error: "User not found",
      formData: req.body,
    });
  }

  // Guardar usuario en sesión
  req.session.user = user;

  res.redirect("/perfil");
});

app.get("/perfil", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("perfil", {
    user: req.session.user,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
app.get("/preferencias", (req, res) => {
  const theme = req.cookies.theme || "light";
  const language = req.cookies.language || "es";

  res.render("preferencias", {
    theme,
    language,
  });
});

app.post("/preferencias", (req, res) => {
  const { theme } = req.body;

  res.cookie("theme", theme, {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 días
  });

  res.redirect("/preferencias");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
