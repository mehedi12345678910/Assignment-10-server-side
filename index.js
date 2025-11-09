const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI from .env
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const bookCollection = client.db("bookHavenDB").collection("books");

    // Test Route
    app.get("/", (req, res) => res.send("Book Haven Server Running..."));

    // All Books
    app.get("/books", async (req, res) => {
      const result = await bookCollection.find().toArray();
      res.send(result);
    });

    // Add Book
    app.post("/add-book", async (req, res) => {
      const data = req.body;
      const result = await bookCollection.insertOne(data);
      res.send(result);
    });

    // Single Book
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Update Book
    app.put("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await bookCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    // Delete Book
    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Add Comment
    app.post("/book/:id/comments", async (req, res) => {
      const bookId = req.params.id;
      const commentData = req.body;

      if (!commentData || !commentData.text || !commentData.userId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid comment data" });
      }

      try {
        await bookCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $push: { comments: { ...commentData, createdAt: new Date() } } }
        );
        res.status(200).json({ success: true, message: "Comment added!" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });
    console.log(" MongoDB Connected");
  } finally {
    // close connection
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => console.log(`✅ Server running on port: ${port}`));
