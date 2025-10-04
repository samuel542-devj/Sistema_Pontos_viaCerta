    const express = require("express");   // precisa estar presente
    const app = express();
    const path = require("path");
    const bodyParser = require("body-parser");
    const session = require("express-session");

    



    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    app.use(session({secret:"segredo",resave:false, saveUninitialized:true}));

    const alunosRoutes = require("./routes/aluno");
    const adminRoutes = require("./routes/admin"); // se o arquivo for admin.js

    app.use("/alunos", alunosRoutes);
    app.use("/admin", adminRoutes);

    app.get("/", (req, res) => res.render("index")); // Isso abriria a página aluno.ejs
    app.listen(process.env.PORT || 3000, () => console.log("Servidor rodando na porta 3000"));

    app.use(express.static(path.join(__dirname, "public")));

