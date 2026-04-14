const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post("/upload-zip", upload.single("zip"), async (req, res) => {
  const zip = new AdmZip(req.file.path);
  const entries = zip.getEntries();

  for (let entry of entries) {
    if (!entry.isDirectory) {
      const fileData = entry.getData();

      const filePath = `pyqs/${entry.entryName}`;

      // Upload to Supabase Storage
      await supabase.storage
        .from("pyqs")
        .upload(filePath, fileData, {
          contentType: "application/pdf",
        });

      // Save metadata in DB
      await supabase.from("pyqs").insert({
        title: entry.entryName,
        pdf_url: filePath,
      });
    }
  }

  res.json({ message: "ZIP processed" });
});

module.exports = router;