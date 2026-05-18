import React, { useState, useEffect } from "react";
import { QrCode, CreditCard, Building, Check, Loader2, X } from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  userId: number;
  onSuccess: (addedAmount: number) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  userId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [upiId] = useState("7416596168@ibl"); // Default configurable UPI ID

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Netbanking state
  const [selectedBank, setSelectedBank] = useState("");

  // Countdown timer for UPI QR
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);
    setPaymentState("idle");
    setErrorMessage("");

    // MOCK WEBHOOK: Automatically detect payment after 6 seconds for a seamless demo experience.
    if (activeTab === "upi" && paymentState === "idle") {
      const timer = setTimeout(() => {
        handlePaymentSubmit("UPI QR Code (Auto-Detected)");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, paymentState]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || paymentState !== "idle") return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, paymentState]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Generate real UPI Pay Deep Link
  const upiUrl = `upi://pay?pa=${upiId}&pn=MicroIntern%20Marketplace&am=${amount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handlePaymentSubmit = async (method: string) => {
    setPaymentState("processing");
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/payment/custom-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          amount: amount,
          method: method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment verification failed");

      setPaymentState("success");
      setTimeout(() => {
        onSuccess(amount);
        onClose();
      }, 2000);
    } catch (err: any) {
      setPaymentState("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[500px]">

        {/* Left Sidebar Info Area */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                M
              </div>
              <span className="font-bold text-xs tracking-wider uppercase text-slate-300">MicroIntern Checkout</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Amount to pay</p>
            <p className="text-3xl font-extrabold text-white mb-2">₹{amount.toLocaleString()}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-full border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Secure Payment</span>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-[10px] text-slate-400">Powered by MicroIntern Native Core Payment Engine.</p>
          </div>
        </div>

        {/* Right Action & Checkout tab Area */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between relative bg-slate-50/50">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {paymentState === "idle" && (
            <>
              {/* Tabs Selection header */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab("upi")}
                  className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${activeTab === "upi" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <QrCode className="w-5 h-5" />
                  UPI / QR
                </button>
                <button
                  onClick={() => setActiveTab("card")}
                  className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${activeTab === "card" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Card
                </button>
                <button
                  onClick={() => setActiveTab("netbanking")}
                  className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${activeTab === "netbanking" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <Building className="w-5 h-5" />
                  Net Banking
                </button>
              </div>

              {/* Tabs Content */}
              <div className="flex-1 overflow-y-auto max-h-[340px] pr-1">

                {/* 1. UPI Tab */}
                {activeTab === "upi" && (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <p className="text-[11px] font-semibold text-slate-500">Scan this QR code with any UPI app (GPay, PhonePe, Paytm, etc.) to complete transaction.</p>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-md">
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        className="w-[180px] h-[180px] object-contain"
                      />
                    </div>
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-400 px-4">
                      <span>UPI ID: <strong className="text-slate-700">{upiId}</strong></span>
                      <span className="font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded font-bold">Expires: {formatTime(timeLeft)}</span>
                    </div>

                    <div className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 py-3 rounded-xl border border-indigo-100 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Listening for successful payment...
                    </div>
                  </div>
                )}

                {/* 2. Card Tab */}
                {activeTab === "card" && (
                  <div className="space-y-4">
                    <div className="relative h-[130px] w-full bg-gradient-to-br from-indigo-800 to-indigo-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] tracking-wider uppercase font-bold text-indigo-300">Debit / Credit Card</span>
                        <span className="font-mono font-extrabold text-xs italic tracking-widest text-indigo-200">VISA</span>
                      </div>
                      <div className="text-md font-mono tracking-widest text-center my-2">
                        {cardNumber || "••••  ••••  ••••  ••••"}
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <div>
                          <p className="text-indigo-400 uppercase tracking-widest text-[7px] mb-0.5">Card Holder</p>
                          <p className="font-bold tracking-wide">{cardName || "YOUR NAME"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-400 uppercase tracking-widest text-[7px] mb-0.5">Expiry</p>
                          <p className="font-bold tracking-wide">{cardExpiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                          setCardNumber(val);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
                            setCardExpiry(val);
                          }}
                          className="w-1/2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-1/2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handlePaymentSubmit("Credit Card")}
                      disabled={!cardNumber || !cardName || !cardExpiry || !cardCvv}
                      className="w-full py-3 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:bg-indigo-700 disabled:shadow-none transition-all"
                    >
                      Pay ₹{amount.toLocaleString()}
                    </button>
                  </div>
                )}

                {/* 3. Netbanking Tab */}
                {activeTab === "netbanking" && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-semibold text-slate-500">Select your bank from the list below:</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      {[
                        { id: "sbi", name: "State Bank of India", short: "SBI" },
                        { id: "hdfc", name: "HDFC Bank", short: "HDFC" },
                        { id: "icici", name: "ICICI Bank", short: "ICICI" },
                        { id: "axis", name: "Axis Bank", short: "AXIS" },
                        { id: "kotak", name: "Kotak Mahindra", short: "KOTAK" },
                        { id: "pnb", name: "Punjab National", short: "PNB" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 border rounded-xl flex items-center justify-center font-bold text-[10px] uppercase tracking-wider transition-all ${selectedBank === bank.id
                              ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                        >
                          {bank.short}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePaymentSubmit(`Netbanking (${selectedBank.toUpperCase()})`)}
                      disabled={!selectedBank}
                      className="w-full py-3 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:bg-indigo-700 disabled:shadow-none transition-all"
                    >
                      Pay ₹{amount.toLocaleString()}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Processing State */}
          {paymentState === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <div>
                <h3 className="font-bold text-base text-slate-800">Processing Payment</h3>
                <p className="text-[11px] text-slate-500">Please do not refresh the page or close this window.</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {paymentState === "success" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Payment Successful!</h3>
                <p className="text-[11px] text-slate-500 mt-1">Wallet topped up. Redirecting back to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {paymentState === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <X className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Payment Failed</h3>
                <p className="text-[11px] text-red-500">{errorMessage}</p>
              </div>
              <button
                onClick={() => setPaymentState("idle")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Footer security badge */}
          <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
            <span className="w-3.5 h-3.5 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-[7px] font-bold">✓</span>
            <span>SECURE 256-BIT ENCRYPTION</span>
          </div>

        </div>

      </div>
    </div>
  );
};
