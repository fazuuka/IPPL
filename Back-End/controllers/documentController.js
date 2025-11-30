import db from "../config/db.js";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { generateFileHash } from "../utils/Hash.js";
import { addToBlockchain } from "../utils/blockchain.js";

export const uploadDocument = async (req, res) => {
  try {
    const { owner_name, document_type } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = req.file.buffer;

    // 1. Generate Hash
    const hash = generateFileHash(fileBuffer);

    // 2. Save document file
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `uploads/${fileName}`;
    fs.writeFileSync(filePath, fileBuffer);

    // 3. Generate QR
    const qrName = `${hash}.png`;
    const qrPath = `qr/${qrName}`;
    await QRCode.toFile(qrPath, hash);

    // 4. Add to Blockchain
    const blockchainTx = addToBlockchain(hash);

    // 5. Save to database
    const sql = `
      INSERT INTO documents 
      (owner_name, document_type, original_name, file_path, hash_value, qr_path, blockchain_tx)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [owner_name, document_type, originalName, filePath, hash, qrPath, blockchainTx],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
          message: "Document uploaded successfully",
          document_id: result.insertId,
          hash,
           qr_path: `http://localhost:5000/${qrPath}`, // bikin URL langsung
           blockchain_tx: blockchainTx
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyDocumentByFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const buffer = req.file.buffer;
    const hash = generateFileHash(buffer);

    const sql = "SELECT * FROM documents WHERE hash_value = ? LIMIT 1";

    db.query(sql, [hash], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length === 0) {
        return res.json({
          valid: false,
          message: "Document is NOT valid",
          hash_checked: hash
        });
      }

      res.json({
        valid: true,
        message: "Document is VALID",
        document: result[0]
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyDocumentByQR = async (req, res) => {
  try {
    const { hash } = req.body;

    if (!hash)
      return res.status(400).json({ message: "Hash is required" });

    const sql = "SELECT *, FROM documents WHERE hash_value = ? LIMIT 1";

    db.query(sql, [hash], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length === 0) {
        return res.json({
          valid: false,
          message: "QR invalid / document not found",
          hash
        });
      }

      res.json({
        valid: true,
        message: "QR valid — document exists",
        document: result[0]
      });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

export const getAllDocuments = (req, res) => {
  const sql = "SELECT * original_name AS name FROM documents ORDER BY upload_date DESC";
  db.query(sql, (err, rows) => {  
    if (err) return res.status(500).json({ error: err });

    const mapped = rows.map(doc => ({
      id: doc.id,
      name: doc.name, 
      category: doc.document_type,
      hash: doc.hash_value,
      status: doc.status === "valid" ? "active" : "revoked",
      uploadDate: formatDate(doc.upload_date),  // ⬅ FORMAT BARU
      file: doc.file_path,
      qr: doc.qr_path
    }));

    res.json({
      message: "Documents loaded successfully",
      count: mapped.length,
      documents: mapped
    });
  });
};




