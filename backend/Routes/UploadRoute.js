// Routes/UploadRoute.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = file.mimetype?.startsWith("image/");
  if (!ok) return cb(new Error("Only image files are allowed"));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload
router.post("/", (req, res) => {
  upload.array("images", 8)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    const files = req.files || [];
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return res.json({ urls });
  });
});

export default router; // ✅ REQUIRED
