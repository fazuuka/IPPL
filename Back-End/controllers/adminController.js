import db from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const loginAdmin = (req, res) => {
 console.log("REQUEST BODY:", req.body);  // DEBUG


  const { email, password } = req.body;

  const sql = "SELECT * FROM admin WHERE email = ? LIMIT 1";

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length === 0)
      return res.status(400).json({ message: "Admin not found" });

    const admin = result[0];

    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login success", token });
  });
};
