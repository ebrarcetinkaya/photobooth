const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execFile } = require("child_process");
const PDFDocument = require("pdfkit");

const STRIP_W = 600;
const STRIP_H = 1800;

function decodeBase64Image(base64Image) {
  return Buffer.from(
    base64Image.replace(/^data:image\/\w+;base64,/, ""),
    "base64",
  );
}

// Orijinal ismi bozmamak adına buildDoubleStripJpeg bıraktım ama içi tamamen PNG
async function buildDoubleStripJpeg(sourceBuffer) {
  // 1. Gelen fotoğrafı PNG olarak işle
  const stripBuffer = await sharp(sourceBuffer)
    .resize(STRIP_W, STRIP_H, { fit: "fill" })
    .png() // <--- JPEG YERİNE PNG
    .toBuffer();

  // 2. İki şeridi yan yana koy
  const doubleStripBuffer = await sharp({
    create: {
      width: STRIP_W * 2,
      height: STRIP_H,
      channels: 4, // <--- PNG ŞEFFAFLIĞI İÇİN 4 (RGBA) KANAL YAPILDI
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // Beyaz arka plan
    },
  })
    .composite([
      { input: stripBuffer, left: 0, top: 0 },
      { input: stripBuffer, left: STRIP_W, top: 0 },
    ])
    .png() // <--- BURASI DA PNG
    .toBuffer();

  // 3. Ayna Taşma Payı (Bleed) - DNP yazıcının yiyeceği pay
  return sharp(doubleStripBuffer)
    .extend({
      top: 15,
      bottom: 15,
      left: 20,
      right: 20,
      extendWith: "mirror",
    })
    .png() // <--- VE BURASI DA PNG
    .toBuffer();
}

function createPdf(imagePath, outputDir) {
  const pdfPath = path.join(outputDir, `print_${Date.now()}.pdf`);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [298, 443], // Taşma paylı DNP boyutu
      margin: 0,
      autoFirstPage: false,
    });

    doc.addPage({
      size: [298, 443],
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
    doc.pipe(stream);

    doc.image(imagePath, 0, 0, { width: 298, height: 443 });
    doc.end();
  });
}

async function preparePrintAssets(base64Image, outputDir) {
  const sourceBuffer = decodeBase64Image(base64Image);
  const doubleStripBuffer = await buildDoubleStripJpeg(sourceBuffer);

  // DOSYA KAYIT UZANTISINI PNG YAPTIK
  const pngPath = path.join(outputDir, `double_strip_${Date.now()}.png`);
  await fs.promises.writeFile(pngPath, doubleStripBuffer);

  const pdfPath = await createPdf(pngPath, outputDir);
  // Orijinal objeni bozmamak için 'doubleStripPath' key'ini korudum
  return { doubleStripPath: pngPath, pdfPath };
}

function resolveSumatraPath() {
  const candidates = [
    process.env.SUMATRA_PATH,
    path.join(__dirname, "SumatraPDF.exe"),
    "C:\\Program Files\\SumatraPDF\\SumatraPDF.exe",
    "C:\\Program Files (x86)\\SumatraPDF\\SumatraPDF.exe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    "SumatraPDF.exe bulunamadı. SUMATRA_PATH değişkenine tam yolu yazın.",
  );
}

function printPdfWithSumatra(pdfPath, printerName) {
  const sumatraPath = resolveSumatraPath();

  const settings = "portrait,noscale";

  const args = [
    "-silent",
    "-print-to",
    printerName,
    "-print-settings",
    settings,
    pdfPath,
  ];

  return new Promise((resolve, reject) => {
    execFile(sumatraPath, args, (error) => {
      if (error) {
        reject(new Error(`Sumatra baskı hatası: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

module.exports = { preparePrintAssets, printPdfWithSumatra };
