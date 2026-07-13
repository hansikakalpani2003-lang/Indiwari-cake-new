import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ dataUrl, token, orderRef }) => {
  const svgRef = useRef(null);

  // ✅ Fix: window.location.origin use කරනවා
  // Dev:        http://localhost:5173/order/abc123
  // Production: https://yourdomain.com/order/abc123
  const publicOrderUrl = `${window.location.origin}/order/${token}`;

  const handleDownload = () => {
    if (dataUrl) {
      const link    = document.createElement('a');
      link.href     = dataUrl;
      link.download = `IndiwariCake-QR-${orderRef}.png`;
      link.click();
      return;
    }

    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl  = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = 192;
      canvas.height = 192;
      const ctx     = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 192, 192);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);

      const link    = document.createElement('a');
      link.download = `IndiwariCake-QR-${orderRef}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = svgUrl;
  };

  const canDownload = !!dataUrl || !!token;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm inline-block">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR code for order ${orderRef}`}
            className="w-48 h-48 object-contain"
          />
        ) : token ? (
          <div className="flex flex-col items-center gap-2">
            <div ref={svgRef}>
              <QRCodeSVG value={publicOrderUrl} size={192} level="H" includeMargin />
            </div>
            <p className="text-xs text-gray-400 text-center">
              QR still generating — this is a live preview.
            </p>
          </div>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-gray-400">
            <p className="text-sm text-center">QR code not available yet.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Scan this QR code with any smartphone camera to view full order details — no app or login required.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {canDownload && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            ⬇ Download QR
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          🖨 Print Page
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;