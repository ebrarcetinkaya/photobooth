require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const http = require("http");
const { print: printFile } = require("pdf-to-printer");
const { preparePrintAssets, printPdfWithSumatra } = require("./printService");

const app = express();
const PORT = process.env.PORT || 3001;
const PHOTOS_DIR = path.join(__dirname, "saved_photos");

if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });
const recentPrintRequests = new Map();
const inFlightPrints = new Set();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const { execSync } = require("child_process");

// Yönetici yetkisi kontrolü (sadece Windows)
try {
  execSync("net session", { stdio: "ignore" });
} catch {
  console.error("❌ Lütfen terminali yönetici olarak çalıştırın!");
  process.exit(1);
}

// ─── FOTOĞRAFLARI STATIK OLARAK SERVİS ET ────────────────────────────────────
app.use("/photos", express.static(PHOTOS_DIR));

// ─── 7 GÜNLÜK OTOMATİK TEMİZLEME RUTİNİ ─────────────────────────────────────
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function cleanOldPhotos() {
  const now = Date.now();
  fs.readdir(PHOTOS_DIR, (err, files) => {
    if (err) return console.error("Temizleme hatası:", err);
    files.forEach((file) => {
      const filePath = path.join(PHOTOS_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > SEVEN_DAYS_MS) {
          fs.unlink(filePath, (err) => {
            if (!err) console.log("🗑️ Eski fotoğraf silindi:", file);
          });
        }
      });
    });
  });
}

// Sunucu başlayınca bir kez çalıştır, sonra her gün kontrol et
cleanOldPhotos();
setInterval(cleanOldPhotos, 24 * 60 * 60 * 1000);

// ─── API: FOTOĞRAF KAYDET & URL DÖNDÜR ───────────────────────────────────────
app.post("/api/save-photo", (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res
      .status(400)
      .json({ success: false, message: "Görsel bulunamadı." });
  }
  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const fileName = `photo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.jpg`;
    const filePath = path.join(PHOTOS_DIR, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const host = process.env.HOST_IP || "localhost";
    const photoUrl = `http://${host}:${PORT}/photos/${fileName}`;
    console.log("📸 Fotoğraf kaydedildi:", photoUrl);
    res.json({ success: true, url: photoUrl });
  } catch (err) {
    console.error("Kaydetme hatası:", err);
    res
      .status(500)
      .json({ success: false, message: "Fotoğraf kaydedilemedi." });
  }
});

// ─── E-POSTA AYARI (Nodemailer) ───────────────────────────────────────────────
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// ─── API: E-POSTA GÖNDER ──────────────────────────────────────────────────────
app.post("/api/email/send", async (req, res) => {
  const { email, image } = req.body;
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "EMAIL_USER ve EMAIL_PASS .env içinde tanımlı olmalı.",
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: `"Foto Kabin" <${EMAIL_USER}>`,
      to: email,
      subject: "Fotoğrafın Hazır! 📸",
      text: "Merhaba, foto kabinde çekindiğin fotoğrafın ekte yer alıyor!",
      attachments: [{ filename: "fotograf.jpg", content: imageBuffer }],
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("E-posta gönderim hatası:", err);
    res.status(500).json({ success: false, message: "E-posta gönderilemedi." });
  }
});

// ─── API: YAZICIYA GÖNDER ─────────────────────────────────────────────────────
app.post("/api/print", async (req, res) => {
  const { image } = req.body;
  try {
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Yazdırılacak görsel bulunamadı.",
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageHash = crypto
      .createHash("sha1")
      .update(base64Data)
      .digest("hex");

    const preventParallelPrint = process.env.PREVENT_PARALLEL_PRINT === "true";
    if (preventParallelPrint) {
      if (inFlightPrints.has(imageHash)) {
        return res.json({
          success: true,
          skippedDuplicate: true,
          message: "Baski islemi zaten devam ediyor.",
        });
      }
      inFlightPrints.add(imageHash);
    }

    const now = Date.now();
    const duplicateWindowMs = Number(
      process.env.PRINT_DUPLICATE_WINDOW_MS || "0",
    );

    if (duplicateWindowMs > 0) {
      for (const [hash, ts] of recentPrintRequests.entries()) {
        if (now - ts > duplicateWindowMs) recentPrintRequests.delete(hash);
      }

      if (
        recentPrintRequests.has(imageHash) &&
        now - recentPrintRequests.get(imageHash) < duplicateWindowMs
      ) {
        console.log("⏭️ Duplicate baskı atlandı:", imageHash);
        return res.json({
          success: true,
          skippedDuplicate: true,
          message: "Aynı fotoğraf ikinci kez algılandı, tekrar baskı atlandı.",
        });
      }

      recentPrintRequests.set(imageHash, now);
    }

    const printerName = process.env.PRINTER_NAME || "DP-DS620";

    // ─── YENİ EKLENEN YAZICI ÇEVRİMİÇİ KONTROLÜ ───
    const isOffline = await new Promise((resolve) => {
      const checkCommand = `powershell "(Get-WmiObject -class Win32_Printer -Filter \\"Name='${printerName}'\\").WorkOffline"`;
      exec(checkCommand, (error, stdout) => {
        if (error) {
          // Komut çalışmazsa varsayılan olarak çevrimiçi kabul edip yazdırmayı deniyoruz
          resolve(false);
        } else {
          // Çıktı 'True' ise yazıcı donanımsal olarak bağlı değildir
          resolve(stdout.trim() === "True");
        }
      });
    });

    if (isOffline) {
      console.log("⚠️ Hata: Yazıcı bağlı değil veya çevrimdışı.");
      if (preventParallelPrint) {
        inFlightPrints.delete(imageHash);
      }
      return res.status(200).json({
        success: false,
        error: "Yazıcı bağlı değil veya kapalı.",
      });
    }
    // ───────────────────────────────────────────────

    const { doubleStripPath, pdfPath } = await preparePrintAssets(
      image,
      PHOTOS_DIR,
    );

    const paperSize = process.env.PRINTER_PAPER_SIZE || "(6x4)";
    const useSumatra = process.env.PRINT_USE_SUMATRA !== "false";

    const alwaysRunPdfToPrinter =
      process.env.PRINT_ALWAYS_PDF_TO_PRINTER !== "true";

    if (useSumatra) {
      try {
        await printPdfWithSumatra(pdfPath, printerName);
        console.log("🖨️ Sumatra ile yazdırıldı:", printerName, pdfPath);
      } catch (sumatraErr) {
        console.warn(
          "⚠️ Sumatra basamadi, pdf-to-printer ile devam:",
          sumatraErr.message,
        );
      }
    }

    if (alwaysRunPdfToPrinter) {
      await printFile(pdfPath, {
        printer: printerName,
        paperSize,
        orientation: "landscape",
        scale: "noscale",
      });
      console.log(
        "🖨️ pdf-to-printer ile yazdırıldı:",
        printerName,
        paperSize,
        pdfPath,
      );
    }

    setTimeout(
      () => {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        if (fs.existsSync(doubleStripPath) && doubleStripPath !== pdfPath) {
          fs.unlinkSync(doubleStripPath);
        }
      },
      10 * 60 * 1000,
    );

    console.log("🖨️ Yazıcıya gönderildi:", printerName, pdfPath);
    res.json({ success: true, printer: printerName });
  } catch (err) {
    const base64Data = req.body?.image?.replace(/^data:image\/\w+;base64,/, "");
    if (base64Data) {
      const imageHash = crypto
        .createHash("sha1")
        .update(base64Data)
        .digest("hex");
      recentPrintRequests.delete(imageHash);
    }
    console.error("Yazdırma hatası:", err);
    res.status(500).json({
      success: false,
      message: err?.message || "Yazdırma sırasında hata oluştu.",
    });
  } finally {
    if (process.env.PREVENT_PARALLEL_PRINT === "true" && req.body?.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
      const imageHash = crypto
        .createHash("sha1")
        .update(base64Data)
        .digest("hex");
      inFlightPrints.delete(imageHash);
    }
  }
});

// ─── CANON EOS 600D - CameraControlCmd.exe ───────────────────────────────────
const DCC_CMD = `"C:\\Program Files (x86)\\digiCamControl\\CameraControlCmd.exe"`;

// KAMERA DURUM KONTROLÜ
app.get("/api/camera/status", (req, res) => {
  const cmd = `${DCC_CMD} /list`;
  exec(cmd, { timeout: 8000 }, (error, stdout, stderr) => {
    const output = (stdout + stderr).toLowerCase();
    if (
      output.includes("canon") ||
      output.includes("nikon") ||
      output.includes("driver")
    ) {
      return res.json({ connected: true, message: "Kamera hazır." });
    }
    return res.json({ connected: false, message: "Kamera bulunamadı." });
  });
});

// FOTOĞRAF ÇEKİMİ
app.post("/api/camera/capture", (req, res) => {
  const tempPath = path.join(PHOTOS_DIR, `canon_${Date.now()}.jpg`);
  const cmd = `${DCC_CMD} /capture /filename "${tempPath}"`;

  exec(cmd, { timeout: 20000 }, (error, stdout, stderr) => {
    const output = stdout + stderr;
    console.log("DCC Output:", output);

    // Başarı kontrolü
    if (output.includes("Transfer done")) {
      // Dosyanın yazılmasını bekle
      setTimeout(() => {
        if (!fs.existsSync(tempPath)) {
          return res
            .status(500)
            .json({ success: false, message: "Fotoğraf kaydedilemedi." });
        }
        try {
          const imageBuffer = fs.readFileSync(tempPath);
          const base64 =
            "data:image/jpeg;base64," + imageBuffer.toString("base64");
          fs.unlinkSync(tempPath);
          return res.json({ success: true, image: base64 });
        } catch (err) {
          return res
            .status(500)
            .json({ success: false, message: "Dosya okunamadı." });
        }
      }, 1500);
      return;
    }

    // Hata durumları
    if (output.includes("Device Busy")) {
      return res
        .status(500)
        .json({ success: false, message: "Kamera meşgul. Lütfen bekle." });
    }
    if (output.includes("no camera") || output.includes("No camera")) {
      return res
        .status(500)
        .json({ success: false, message: "Kamera bağlı değil." });
    }

    return res
      .status(500)
      .json({ success: false, message: "Çekim başarısız: " + output });
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Backend (Sadece Çekim Modu) ${PORT} portunda çalışıyor.`),
);
