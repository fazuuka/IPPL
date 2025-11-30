import express from "express";
import upload from "../middleware/upload.js";
import { uploadDocument } from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);

export default router;


import { verifyDocumentByFile } from "../controllers/documentController.js";

router.post("/verify/file", upload.single("file"), verifyDocumentByFile);


import { verifyDocumentByQR } from "../controllers/documentController.js";

router.post("/verify/qr", verifyDocumentByQR);


import { getAllDocuments } from "../controllers/documentController.js";

router.get("/", getAllDocuments);
