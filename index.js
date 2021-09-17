const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database."))
  .catch((error) => console.log(error));

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  dateCreated: {
    type: String,
    default: new Date(),
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const Article = new mongoose.model("Article", articleSchema);

app.get("/", async (req, res) => {
  const articles = await Article.find({}).sort({ votes: -1 });
  res.render("index", { articles });
});

app.get("/articles/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/articles/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render("show", { article });
});

app.put("/articles/:id/upvote", async (req, res) => {
  const article = await Article.findById(req.params.id);

  let votes = article.votes + 1;
  await Article.findByIdAndUpdate(article.id, { votes });
  res.redirect(`/articles/${article.id}`);
});

app.put("/articles/:id/downvote", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article.votes === 0) {
    return res.redirect(`/articles/${article.id}`);
  }

  let votes = article.votes - 1;
  await Article.findByIdAndUpdate(article.id, { votes });
  res.redirect(`/articles/${article.id}`);
});

app.post("/articles/new", async (req, res) => {
  const article = new Article(req.body);
  article.save();
  res.redirect("/");
});

app.get("/articles/:id/edit", async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render("edit", { article });
});

app.put("/articles/:id/edit", async (req, res) => {
  await Article.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/");
});

app.delete("/articles/:id/delete", async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

app.listen(3000, () => console.log("listening"));
