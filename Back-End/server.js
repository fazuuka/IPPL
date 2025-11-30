import express from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/qr", express.static(path.join(__dirname, "qr")));

app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
