/**
 * RealQR.jsx
 * Generates a real, scannable QR code as a PNG data URL.
 * Run once: npm install qrcode
 *
 * Props:
 *   url        — string to encode  e.g. "https://yourapp.com/app?train=12139"
 *   size       — pixel dimensions  (default 200)
 *   darkColor  — module colour     (default "#0a0f1e")
 *   lightColor — background colour (default "#ffffff")
 */
import { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function RealQR({ url, size = 200, darkColor = "#0a0f1e", lightColor = "#ffffff" }) {
  const [dataUrl, setDataUrl] = useState("");
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!url) return;
    setDataUrl("");
    setError(false);
    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
      errorCorrectionLevel: "M",
    })
      .then(d => setDataUrl(d))
      .catch(() => setError(true));
  }, [url, size, darkColor, lightColor]);

  if (error) return (
    <div style={{
      width: size, height: size, background: "#fef2f2", borderRadius: 8,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", border: "1px solid #fecaca",
    }}>
      <span style={{ fontSize: "1.5rem" }}>❌</span>
      <span style={{ fontSize: "0.65rem", color: "#dc2626", marginTop: 4 }}>QR failed</span>
    </div>
  );

  if (!dataUrl) return (
    <>
      <div style={{
        width: size, height: size, background: "#f8fafc", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px dashed #cbd5e1", animation: "rqr-pulse 1.2s ease infinite",
      }}>
        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Generating…</span>
      </div>
      <style>{`@keyframes rqr-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </>
  );

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      style={{ borderRadius: 8, display: "block" }}
      alt={`QR — ${url}`}
    />
  );
}