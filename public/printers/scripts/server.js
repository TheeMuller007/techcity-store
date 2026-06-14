const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const path = require("path");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Chatbot company knowledge
const COMPANY_KNOWLEDGE = `
You are Tech City Assistant, an official customer support chatbot.
Answer ONLY using company info below...
...
`;

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: COMPANY_KNOWLEDGE },
        { role: "user", content: userMessage }
      ],
      temperature: 0.2
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Our support assistant is currently unavailable." });
  }
});

// Fallback route: serve folder/index.html or public/index.html
app.get("*", (req, res) => {
  const requestedPath = path.join(__dirname, "public", req.path);

  // Check if folder has index.html
  const folderIndex = path.join(requestedPath, "index.html");

  res.sendFile(folderIndex, err => {
    if (err) {
      // Check if requested path is a direct HTML file
      const htmlFile = requestedPath.endsWith(".html") ? requestedPath : null;
      if (htmlFile) {
        res.sendFile(htmlFile, err2 => {
          if (err2) {
            // fallback to home page
            res.sendFile(path.join(__dirname, "public", "index.html"));
          }
        });
      } else {
        // fallback to home page
        res.sendFile(path.join(__dirname, "public", "index.html"));
      }
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
