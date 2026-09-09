import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Globe, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  Share2,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Global cloud URLs hosted on Cloud Run
const PUBLIC_SHARED_URL = 'https://ais-pre-ssxbjom44e5sf7wh6ouiwa-859515137053.asia-southeast1.run.app';
const DEV_CLOUD_URL = 'https://ais-dev-ssxbjom44e5sf7wh6ouiwa-859515137053.asia-southeast1.run.app';

export function MobileAccessModal({ isOpen, onClose }: MobileAccessModalProps) {
  const [selectedUrlType, setSelectedUrlType] = useState<'public' | 'dev' | 'custom'>('public');
  const [customUrl, setCustomUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Determine the active URL to encode into the QR code
  const getActiveUrl = () => {
    if (selectedUrlType === 'public') {
      return PUBLIC_SHARED_URL;
    }
    if (selectedUrlType === 'dev') {
      return DEV_CLOUD_URL;
    }
    if (selectedUrlType === 'custom') {
      const trimmed = customUrl.trim();
      if (!trimmed) return PUBLIC_SHARED_URL;
      return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }
    return PUBLIC_SHARED_URL;
  };

  const activeUrl = getActiveUrl();

  // Generate crisp QR code whenever activeUrl changes or modal opens
  useEffect(() => {
    if (!isOpen || !activeUrl) return;

    QRCode.toDataURL(activeUrl, {
      width: 280,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a', // deep slate
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });
  }, [activeUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="mobile-access-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="mobile-access-modal-content"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 sm:p-6 my-6 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Global Internet Access</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Live Online
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan with any phone camera or open the link anywhere in the world
              </p>
            </div>
          </div>
          <button
            id="close-mobile-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Target Selector */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Cloud Address to Scan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Public Shared URL */}
            <button
              type="button"
              onClick={() => setSelectedUrlType('public')}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                selectedUrlType === 'public'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Public Global URL
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-mono">
                ais-pre-ssxbjom44e5sf...
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                Directly accessible worldwide without logging in.
              </p>
            </button>

            {/* Development URL */}
            <button
              type="button"
              onClick={() => setSelectedUrlType('dev')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedUrlType === 'dev'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-slate-600" />
                  Development URL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-mono">
                ais-dev-ssxbjom44e5sf...
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                Direct development container endpoint.
              </p>
            </button>
          </div>
        </div>

        {/* Custom URL Option toggle */}
        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={() => setSelectedUrlType(selectedUrlType === 'custom' ? 'public' : 'custom')}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline"
          >
            {selectedUrlType === 'custom' ? 'Use Default Public Cloud URL' : 'Use a custom domain or URL'}
          </button>
        </div>

        {selectedUrlType === 'custom' && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Enter Custom Web Address:
            </label>
            <input
              type="text"
              placeholder="https://your-custom-app.com"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* QR Code and Quick Actions */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
          {/* QR Code Canvas */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center shrink-0">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan to open globally on mobile"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
            <span className="text-[11px] font-bold text-slate-700 mt-2 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              Scan with Phone Camera
            </span>
          </div>

          {/* URL Details and Action Buttons */}
          <div className="flex-1 w-full space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Global Web Link
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  HTTPS Secure
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 break-all select-all shadow-2xs">
                {activeUrl}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                id="copy-global-url-btn"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </button>

              <a
                href={activeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
                title="Test this URL in a new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open in Tab</span>
              </a>
            </div>

            {/* Bullet points */}
            <div className="text-xs text-slate-600 space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Works on 4G, 5G, and any Wi-Fi network</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                <span>No local computer or same Wi-Fi connection required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            How to Install as App on Mobile:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Android */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android (Chrome / Samsung)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Scan the QR code or open the link above in Chrome.</li>
                <li>Tap the <strong>Install app</strong> popup or the 3 dots (⋮).</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>The app is placed on your home screen with its icon.</li>
              </ol>
            </div>

            {/* iOS */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>iPhone / iPad (Safari)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Scan the QR code to open in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (square with arrow ↑).</li>
                <li>Select <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>"Add"</strong> to install as a standalone app.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Accessible globally from any device.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
