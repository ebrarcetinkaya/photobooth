import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import "./PhotoBooth.css";

// ─── SABİTLER ─────────────────────────────────────────────────────────────────
const BACKGROUNDS_PATH = "/backgrounds/";
const BACKEND_URL = "http://localhost:3001";

// Klasör yapına göre oluşturduğumuz dinamik şablon sayısı konfigürasyonu
const BACKGROUND_CONFIG = {
  "3lu": {
    themes: {
      "Anne-Cocuk": { label: "Anne - Çocuk", totalImages: 11 },
      Cocuk: { label: "Çocuk Dünyası", totalImages: 15 },
      DogumGunu: { label: "Doğum Günü", totalImages: 10 },
      Gradyan: { label: "Gradyan", totalImages: 15 },
      Leopar: { label: "Leopar Desen", totalImages: 9 },
      MilliBayram: { label: "Milli Bayramlar", totalImages: 5 },
      OzelTemalar: { label: "Özel Temalar", totalImages: 10 },
      SadeTemalar: { label: "Sade Çerçeveler", totalImages: 30 },
      Sevgili: { label: "Sevgililer Günü", totalImages: 13 },
    },
  },
  "4lu": {
    themes: {
      "Anne-Cocuk": { label: "Anne - Çocuk", totalImages: 11 },
      Cocuk: { label: "Çocuk Dünyası", totalImages: 15 },
      DogumGunu: { label: "Doğum Günü", totalImages: 10 },
      Gradyan: { label: "Gradyan", totalImages: 15 },
      Leopar: { label: "Leopar Desen", totalImages: 9 },
      MilliBayram: { label: "Milli Bayramlar", totalImages: 5 },
      OzelTemalar: { label: "Özel Temalar", totalImages: 10 },
      SadeTemalar: { label: "Sade Çerçeveler", totalImages: 30 },
      Sevgili: { label: "Sevgililer Günü", totalImages: 13 },
    },
  },
};

// Film şeridindeki renkli kareler için renk dizisi
const FILM_COLORS = [
  "#ff2d78",
  "#00f5ff",
  "#ffe600",
  "#39ff14",
  "#bf00ff",
  "#ff8c00",
  "#ff2d78",
  "#00f5ff",
  "#ffe600",
  "#39ff14",
  "#bf00ff",
  "#ff8c00",
  "#ff2d78",
  "#00f5ff",
  "#ffe600",
  "#39ff14",
  "#bf00ff",
  "#ff8c00",
  "#ff2d78",
  "#00f5ff",
];

// ─── GLOBAL DEKORASYONLAR ─────────────────────────
function GlobalDecor({ showWelcomeEffects }) {
  const holes = Array.from({ length: 30 });

  return (
    <>
      <div className="bg-glow">
        <span /> <span /> <span />
      </div>

      <div className="film-holes-left">
        {holes.map((_, i) => (
          <div key={i} className="film-hole" />
        ))}
      </div>
      <div className="film-holes-right">
        {holes.map((_, i) => (
          <div key={i} className="film-hole" />
        ))}
      </div>

      {showWelcomeEffects && (
        <>
          <div className="film-strip-top">
            <div className="film-strip-inner">
              {[...FILM_COLORS, ...FILM_COLORS].map((color, i) => (
                <div
                  key={i}
                  className="film-cell"
                  style={{
                    background: color + "33",
                    borderColor: color + "55",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>
                    {["📸", "🎬", "✨", "🌟", "🎞️", "💫"][i % 6]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="film-strip-bottom">
            <div className="film-strip-inner">
              {[...FILM_COLORS, ...FILM_COLORS].map((color, i) => (
                <div
                  key={i}
                  className="film-cell"
                  style={{
                    background: color + "33",
                    borderColor: color + "55",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>
                    {["🎭", "🌈", "⚡", "🔥", "🎨", "💎"][i % 6]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="marquee-wrap top-marquee">
            <div className="marquee-inner">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i}>
                  ✦ FOTOĞRAF ÇEKİM ✦ PHOTO BOOTH ✦ ANI YAKALA ✦ FILM ŞERİDİ ✦
                  SMILE ✦
                </span>
              ))}
            </div>
          </div>

          <div className="marquee-wrap bottom-marquee">
            <div className="marquee-inner">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i}>
                  ★ ANINI ÖLÜMSÜZLEŞTIR ★ CAPTURE THE MOMENT ★ EĞLEN & ÇEK ★
                  PHOTO BOOTH ★
                </span>
              ))}
            </div>
          </div>

          <div className="confetti-wrap">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="confetti-piece" />
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ─── KVKK MODAL ──────────────────────────────────────────────────────────────
function KVKKModal({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a0035",
          border: "1px solid rgba(255,45,120,0.3)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "540px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#e0d6f7",
          lineHeight: 1.7,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "#ff2d78",
            marginBottom: "16px",
            fontSize: "1.2rem",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          KVKK Aydınlatma Metni
        </h2>
        <p style={{ marginBottom: "12px", fontSize: "0.88rem" }}>
          <strong>Veri Sorumlusu:</strong> Fotokabin olarak, 6698 sayılı KVKK
          kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.
        </p>
        <p style={{ marginBottom: "12px", fontSize: "0.88rem" }}>
          <strong>Toplanan Veriler:</strong> Yalnızca e-posta adresiniz
          toplanmaktadır. Fotoğraflar geçici işlenir ve size iletildikten sonra
          silinir.
        </p>
        <p style={{ marginBottom: "12px", fontSize: "0.88rem" }}>
          <strong>İşleme Amacı:</strong> E-posta adresiniz yalnızca
          fotoğraflarınızın iletilmesi için kullanılır.
        </p>
        <p style={{ marginBottom: "12px", fontSize: "0.88rem" }}>
          <strong>Saklama Süresi:</strong> Veriler iletimden sonra en geç 24
          saat içinde silinir.
        </p>
        <p style={{ marginBottom: "20px", fontSize: "0.88rem" }}>
          <strong>Haklarınız:</strong> KVKK Madde 11 kapsamında tüm haklarınızı
          kullanabilirsiniz.
        </p>
        <button
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #ff2d78, #bf00ff)",
            border: "none",
            borderRadius: "50px",
            color: "#fff",
            fontWeight: "700",
            padding: "12px 32px",
            cursor: "pointer",
            fontSize: "0.9rem",
            width: "100%",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Anladım, Kapat
        </button>
      </div>
    </div>
  );
}

// ─── 0. E-POSTA EKRANI ───────────────────────────────────────────────────────
function EmailScreen({ onConfirm }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [showKVKK, setShowKVKK] = useState(false);

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    onConfirm(email);
  };

  return (
    <div className="screen phone-screen clean-screen">
      {showKVKK && <KVKKModal onClose={() => setShowKVKK(false)} />}
      <div className="logo">📧</div>
      <h1>Neredeyse Hazır!</h1>
      <p className="sub">
        Fotoğraflarınızı e-posta ile göndermemizi ister misiniz?
      </p>

      <input
        className="phone-input"
        type="email"
        placeholder="e-posta@örnek.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && kvkkChecked && handleSubmit()}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "4px 0",
          padding: "0 8px",
        }}
      >
        <input
          type="checkbox"
          id="kvkk"
          checked={kvkkChecked}
          onChange={(e) => setKvkkChecked(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            accentColor: "#ff2d78",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <label
          htmlFor="kvkk"
          style={{
            color: "#9b7ec8",
            fontSize: "0.85rem",
            lineHeight: 1.4,
            cursor: "pointer",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowKVKK(true);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#ff2d78",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            KVKK Aydınlatma Metni
          </button>
          {"'ni okudum ve kabul ediyorum."}
        </label>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      <button
        className="confirm-btn"
        onClick={handleSubmit}
        disabled={!kvkkChecked}
        style={{
          opacity: kvkkChecked ? 1 : 0.4,
          cursor: kvkkChecked ? "pointer" : "not-allowed",
        }}
      >
        Tamamla ve Yazdır →
      </button>
      <button
        className="outline-btn"
        style={{ marginTop: "6px" }}
        onClick={() => onConfirm("no-email")}
      >
        E-posta istemiyorum
      </button>
    </div>
  );
}

// ─── 1. HOŞGELDİN EKRANI ─────────────────────────────────────────────────────
function WelcomeScreen({ onSelect }) {
  return (
    <div className="screen welcome">
      <div className="welcome-logo">📸</div>
      <h1 className="welcome-title">Kaçlı Çekim?</h1>
      <p className="welcome-sub">Kaç adet fotoğraf çekmek istersiniz?</p>

      <div className="welcome-layout">
        <div className="badges-left">
          <div className="feature-badge">
            <span className="badge-icon">▦</span>
            <div className="badge-text">
              <strong>QR ile Paylaş</strong>
              <small>Okut, sosyal medyanda hemen paylaş</small>
            </div>
          </div>
          <div className="feature-badge">
            <span className="badge-icon">🎞️</span>
            <div className="badge-text">
              <strong>Film Şeridi</strong>
              <small>Gerçek analog fotoğraf hissi</small>
            </div>
          </div>
          <div className="feature-badge">
            <span className="badge-icon">⭐</span>
            <div className="badge-text">
              <strong>Anında Baskı</strong>
              <small>Saniyeler içinde elinizde</small>
            </div>
          </div>
        </div>

        <div className="choice-row">
          {[3, 4].map((num) => (
            <button
              key={num}
              className="choice-btn"
              onClick={() => onSelect(num)}
            >
              <span className="num">{num}</span>
              <span className="lbl">Fotoğraf</span>
            </button>
          ))}
        </div>

        <div className="badges-right">
          <div className="feature-badge">
            <span className="badge-icon">🖼️</span>
            <div className="badge-text">
              <strong>Özel Çerçeveler</strong>
              <small>Konsepte özel onlarca tasarım</small>
            </div>
          </div>
          <div className="feature-badge">
            <span className="badge-icon">🎨</span>
            <div className="badge-text">
              <strong>Renk Filtreleri</strong>
              <small>Vintage, neon, pastel ve daha fazlası</small>
            </div>
          </div>
          <div className="feature-badge">
            <span className="badge-icon">📱</span>
            <div className="badge-text">
              <strong>Sosyal Medya</strong>
              <small>Instagram, TikTok, WhatsApp'a gönder</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. KAMERA EKRANI (Canon EOS 600D) ───────────────────────────────────────
function CameraScreen({ count, onDone }) {
  const [photos, setPhotos] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [camStatus, setCamStatus] = useState("checking");
  const photosRef = useRef([]);

  useEffect(() => {
    fetch(BACKEND_URL + "/api/camera/status")
      .then((r) => r.json())
      .then((d) => setCamStatus(d.connected ? "ready" : "error"))
      .catch(() => setCamStatus("error"));
  }, []);

  const handleCapture = async () => {
    if (photosRef.current.length >= count) return;

    setCapturing(true);
    try {
      const response = await fetch(BACKEND_URL + "/api/camera/capture", {
        method: "POST",
      });
      const data = await response.json();

      if (!data.success) throw new Error(data.message);

      const next = [...photosRef.current, data.image];
      photosRef.current = next;
      setPhotos([...next]);

      if (next.length >= count) {
        setTimeout(() => onDone(next), 500);
      }
    } catch (err) {
      console.error("Çekim hatası:", err);
      alert("Çekim başarısız, lütfen kamerayı kontrol et.");
    } finally {
      setCapturing(false);
    }
  };

  if (camStatus === "checking")
    return (
      <div className="screen clean-screen">
        <p>📷 Kamera kontrol ediliyor...</p>
      </div>
    );

  if (camStatus === "error")
    return (
      <div className="screen clean-screen">
        <p>⚠️ Kamera bağlı değil.</p>
        <button
          className="confirm-btn"
          onClick={() => window.location.reload()}
        >
          🔄 Tekrar Dene
        </button>
      </div>
    );

  return (
    <div className="screen camera">
      <div className="camera-header">
        <span className="shot-counter">
          {photos.length} / {count} fotoğraf
        </span>
        <span style={{ color: "#39ff14" }}>● Canon EOS 600D Hazır</span>
      </div>

      <div
        className="video-wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0010",
        }}
      >
        {capturing ? (
          <p style={{ color: "#fff", fontSize: "1.5rem" }}>
            📸 Fotoğraf çekiliyor, lütfen bekle...
          </p>
        ) : (
          <p style={{ color: "#9b7ec8" }}>Çekime hazırsın!</p>
        )}
      </div>

      <div className="thumbs-row">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={"thumb-slot" + (photos[i] ? " taken" : "")}>
            {photos[i] ? <img src={photos[i]} alt="t" /> : <span>{i + 1}</span>}
          </div>
        ))}
      </div>

      <button
        className="confirm-btn"
        onClick={handleCapture}
        disabled={capturing}
      >
        {capturing ? "İşleniyor..." : "📸 Fotoğrafı Çek"}
      </button>
    </div>
  );
}
// ─── 3. ÇERÇEVE SEÇİM EKRANI (Yeni Çizime Göre Düzenlendi) ───────────────
function FrameScreen({ photos, onConfirm }) {
  const modeKey = photos.length === 3 ? "3lu" : "4lu";
  const themes = BACKGROUND_CONFIG[modeKey].themes;
  const themeKeys = Object.keys(themes);

  // Kategori seçimi state'i kaldırıldı, tüm şablonlar aynı anda gösterilecek.
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [building, setBuilding] = useState(false);
  const canvasRef = useRef(null);

  // --- SORUNU ÇÖZEN YENİ drawCover FONKSİYONU ---
  const drawCover = (ctx, image, x, y, width, height) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    // Kesme veya zoom yapmadan fotoğrafı deliğin içine TAMAMEN sığdır
    ctx.drawImage(image, x, y, width, height);

    ctx.restore();
  };
  // ----------------------------------------------

  const detectSlots = (frameImg, canvasW, canvasH) => {
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasW;
    offscreen.height = canvasH;
    const offCtx = offscreen.getContext("2d");
    offCtx.drawImage(frameImg, 0, 0, canvasW, canvasH);
    const data = offCtx.getImageData(0, 0, canvasW, canvasH).data;

    const rowHasHole = new Array(canvasH).fill(false);
    const rowMinX = new Array(canvasH).fill(canvasW);
    const rowMaxX = new Array(canvasH).fill(0);

    for (let y = 0; y < canvasH; y++) {
      let hasHole = false;
      for (let x = 0; x < canvasW; x++) {
        const i = (y * canvasW + x) * 4;
        const a = data[i + 3];

        if (a < 50) {
          hasHole = true;
          if (x < rowMinX[y]) rowMinX[y] = x;
          if (x > rowMaxX[y]) rowMaxX[y] = x;
        }
      }
      rowHasHole[y] = hasHole;
    }

    const slots = [];
    let inSlot = false;
    let startY = 0;

    for (let y = 0; y < canvasH; y++) {
      if (rowHasHole[y] && !inSlot) {
        inSlot = true;
        startY = y;
      } else if (!rowHasHole[y] && inSlot) {
        inSlot = false;
        let endY = y;

        if (endY - startY > 50) {
          let minX = canvasW;
          let maxX = 0;
          for (let sy = startY; sy < endY; sy++) {
            if (rowMinX[sy] < minX) minX = rowMinX[sy];
            if (rowMaxX[sy] > maxX) maxX = rowMaxX[sy];
          }
          slots.push({ x: minX, y: startY, w: maxX - minX, h: endY - startY });
        }
      }
    }

    if (inSlot && canvasH - startY > 50) {
      let endY = canvasH;
      let minX = canvasW;
      let maxX = 0;
      for (let sy = startY; sy < endY; sy++) {
        if (rowMinX[sy] < minX) minX = rowMinX[sy];
        if (rowMaxX[sy] > maxX) maxX = rowMaxX[sy];
      }
      slots.push({ x: minX, y: startY, w: maxX - minX, h: endY - startY });
    }
    return slots;
  };

  const buildPreview = useCallback(
    async (frameFile) => {
      if (!canvasRef.current) return;
      setBuilding(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const STRIP_W = 600,
        STRIP_H = 1800;
      canvas.width = STRIP_W;
      canvas.height = STRIP_H;

      const frame = new Image();
      frame.src = BACKGROUNDS_PATH + frameFile;
      await new Promise((r) => (frame.onload = r));

      const allSlots = detectSlots(frame, STRIP_W, STRIP_H);
      const slots = allSlots
        .sort((a, b) => b.h - a.h)
        .slice(0, photos.length)
        .sort((a, b) => a.y - b.y);

      ctx.clearRect(0, 0, STRIP_W, STRIP_H);

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const img = new Image();
        img.src = photos[i];
        await new Promise((r) => (img.onload = r));

        const BLEED = 5;

        drawCover(
          ctx,
          img,
          slot.x - BLEED,
          slot.y - BLEED,
          slot.w + BLEED * 2,
          slot.h + BLEED * 2,
        );
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(frame, 0, 0, STRIP_W, STRIP_H);

      setPreview(canvas.toDataURL("image/jpeg", 0.92));
      setBuilding(false);
    },
    [photos],
  );

  return (
    <div className="screen frame-screen clean-screen">
      <h2>Arka Plan Seçin</h2>
      <div className="frame-layout">
        {/* Sol Menü: Çizimindeki Liste Yapısı */}
        <div className="frame-sidebar">
          {themeKeys.map((themeKey) => {
            const themeInfo = themes[themeKey];
            // O temadaki toplam resim sayısı kadar array oluştur
            const imageNumbers = Array.from(
              { length: themeInfo.totalImages },
              (_, i) => i + 1,
            );

            return (
              <div key={themeKey} className="theme-group">
                <h3 className="theme-group-title">{themeInfo.label}</h3>

                <div className="theme-group-items">
                  {imageNumbers.map((num) => {
                    const fullRelativePath = `${modeKey}/${themeKey}/${num}.png`;
                    const fullUrl = BACKGROUNDS_PATH + fullRelativePath;

                    return (
                      <button
                        key={`${themeKey}-${num}`}
                        className={
                          "frame-option" +
                          (selectedFile === fullRelativePath ? " active" : "")
                        }
                        onClick={() => {
                          setSelectedFile(fullRelativePath);
                          buildPreview(fullRelativePath);
                        }}
                      >
                        <img
                          src={fullUrl}
                          alt={`${themeInfo.label} - Şablon ${num}`}
                          style={{
                            width: "52px",
                            height: "74px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            flexShrink: 0,
                            border:
                              selectedFile === fullRelativePath
                                ? "2px solid #ff2d78"
                                : "2px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        <span>Şablon {num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sağ Alan: Önizleme Ekranı */}
        <div className="preview-panel">
          {preview ? (
            <img src={preview} alt="strip önizleme" className="strip-preview" />
          ) : (
            "Bir arka plan şablonu seçin"
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        className="confirm-btn"
        disabled={!preview || building}
        onClick={() => onConfirm(preview)}
      >
        Devam Et →
      </button>
    </div>
  );
}

// ─── 4. BASKI VE E-POSTA EKRANI ──────────────────────────────────────────────
function PrintScreen({ stripImage, email, onDone, onRestart }) {
  const [status, setStatus] = useState("loading");
  const [emailError, setEmailError] = useState("");
  const [printError, setPrintError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (hasPrinted.current) return;
    hasPrinted.current = true;
    const handleProcesses = async () => {
      try {
        let savedUrl = null;

        // 1. Kaydetme İşlemi
        try {
          const saveRes = await fetch(BACKEND_URL + "/api/save-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: stripImage }),
          });
          if (saveRes.ok) {
            const d = await saveRes.json();
            if (d.url) {
              savedUrl = d.url;
              setPhotoUrl(d.url);
            }
          }
        } catch (e) {
          console.warn("Kaydetme hatası:", e);
        }

        // 2. Yazdırma İşlemi (Güncellendi)
        try {
          const printRes = await fetch(BACKEND_URL + "/api/print", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: stripImage }),
          });

          // Eğer sunucu HTTP 500 gibi bir hata dönerse
          if (!printRes.ok) {
            setPrintError(
              "Yazıcıya ulaşılamadı. Fotoğrafınız dijital olarak kaydedildi.",
            );
          } else {
            // Sunucu cevap verdi, JSON'ı kontrol edelim
            const printData = await printRes.json().catch(() => ({}));

            // Backend yazıcı yokken success: false dönüyorsa yakala
            if (printData.success === false || printData.error) {
              setPrintError(
                "Yazıcı bağlı değil veya çevrimdışı. Fotoğrafınız dijital olarak kaydedildi.",
              );
            }
          }
        } catch {
          // İnternet/Ağ bağlantısı koparsa
          setPrintError(
            "Yazıcı bağlantısı kurulamadı. Fotoğrafınız kaydedildi.",
          );
        }

        // 3. E-posta İşlemi
        if (email && email !== "no-email") {
          try {
            const mailRes = await fetch(BACKEND_URL + "/api/email/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, image: stripImage }),
            });
            if (!mailRes.ok) setEmailError("E-posta gönderilemedi.");
          } catch {
            setEmailError("E-posta gönderilemedi.");
          }
        }

        setStatus(savedUrl ? "done" : "error");
      } catch {
        setStatus("error");
      }
    };
    handleProcesses();
  }, [stripImage, email]);

  return (
    <div className="screen print-screen clean-screen">
      {status === "loading" ? (
        <h2>Fotoğraflarınız Hazırlanıyor... ⏳</h2>
      ) : status === "error" ? (
        <>
          <div className="error-box">⚠️ Fotoğraf kaydedilemedi.</div>
          <p className="sub">Lütfen tekrar deneyin.</p>
          <button className="confirm-btn" onClick={onRestart}>
            Yeniden Dene
          </button>
        </>
      ) : (
        <>
          {/* Yazıcı hatası varsa yeşil tik yerine telefon ikonu göster */}
          <div className="success-icon">{printError ? "📱" : "✅"}</div>
          <h2>Harika Görünüyorsun!</h2>

          {printError && (
            <div
              className="error-box"
              style={{
                fontSize: "0.85rem",
                margin: "10px 0",
                background: "rgba(255,165,0,0.15)",
                borderColor: "orange",
                color: "#ffd280",
              }}
            >
              🖨️ {printError}
            </div>
          )}

          {emailError && (
            <div
              className="error-box"
              style={{ fontSize: "0.85rem", margin: "10px 0" }}
            >
              📧 {emailError}
            </div>
          )}

          <p className="sub">
            {/* Yazıcı hatası YOKSA başarı mesajını göster */}
            {!printError && "Fotoğrafın yazıcıya gönderildi"}
            {email !== "no-email" && !emailError && " ve e-postana yollandı."}
          </p>

          <button
            className="confirm-btn"
            onClick={() => onDone(photoUrl)}
            style={{ marginBottom: "8px", marginTop: "12px" }}
          >
            📱 Telefona İndir (QR)
          </button>
          <button className="outline-btn" onClick={onRestart}>
            Yeni Çekim
          </button>
        </>
      )}
    </div>
  );
}
// ─── 5. QR EKRANI ─────────────────────────────────────────────────────────────
function QRScreen({ photoUrl, onRestart }) {
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    if (remaining <= 0) {
      onRestart();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onRestart]);

  return (
    <div
      className="screen clean-screen"
      style={{
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 80px",
      }}
    >
      <div className="logo">📱</div>
      <h1>Fotoğrafını İndir!</h1>
      <p className="sub" style={{ marginBottom: "8px" }}>
        QR kodu telefonunun kamerasıyla okut, fotoğrafın direkt açılsın.
      </p>
      {photoUrl ? (
        <div
          style={{
            display: "inline-block",
            background: "#fff",
            padding: "20px",
            borderRadius: "16px",
            boxShadow: "0 0 40px rgba(255,45,120,0.4)",
            margin: "8px 0 16px",
          }}
        >
          <QRCode
            value={photoUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#0a0010"
            level="M"
          />
        </div>
      ) : (
        <p className="sub" style={{ margin: "16px 0" }}>
          QR oluşturuluyor...
        </p>
      )}
      <p
        style={{ color: "#9b7ec8", fontSize: "0.82rem", marginBottom: "16px" }}
      >
        {remaining} saniye sonra otomatik yeni çekime dönülecek
      </p>
      <button className="confirm-btn" onClick={onRestart}>
        Yeni Çekim
      </button>
    </div>
  );
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function PhotoBooth() {
  const [step, setStep] = useState("welcome");
  const [email, setEmail] = useState("");
  const [photoCount, setPhotoCount] = useState(4);
  const [photos, setPhotos] = useState([]);
  const [stripImage, setStripImage] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const restart = () => {
    setStep("welcome");
    setEmail("");
    setPhotos([]);
    setStripImage(null);
    setPhotoUrl(null);
  };

  const isWelcome = step === "welcome";

  return (
    <div className="photobooth-app">
      <GlobalDecor showWelcomeEffects={isWelcome} />
      {step === "welcome" && (
        <WelcomeScreen
          onSelect={(n) => {
            setPhotoCount(n);
            setStep("camera");
          }}
        />
      )}
      {step === "camera" && (
        <CameraScreen
          count={photoCount}
          onDone={(p) => {
            setPhotos(p);
            setStep("frame");
          }}
        />
      )}
      {step === "frame" && (
        <FrameScreen
          photos={photos}
          onConfirm={(img) => {
            setStripImage(img);
            setStep("email");
          }}
        />
      )}
      {step === "email" && (
        <EmailScreen
          onConfirm={(e) => {
            setEmail(e);
            setStep("print");
          }}
        />
      )}
      {step === "print" && (
        <PrintScreen
          stripImage={stripImage}
          email={email}
          onDone={(url) => {
            setPhotoUrl(url);
            setStep("qr");
          }}
          onRestart={restart}
        />
      )}
      {step === "qr" && <QRScreen photoUrl={photoUrl} onRestart={restart} />}
    </div>
  );
}
