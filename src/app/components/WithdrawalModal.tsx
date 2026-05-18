import React, { useState, useEffect } from "react";
import { QrCode, CreditCard, Building, Check, Loader2, X } from "lucide-react";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  userId: number;
  onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  amount,
  userId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"upi" | "bank" | "card">("upi");
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // UPI Form State
  const [upiId, setUpiId] = useState("");

  // Bank Form State
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Card Form State
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPaymentState("idle");
    setErrorMessage("");
    setUpiId("");
    setBankName("");
    setAccountHolder("");
    setAccountNumber("");
    setIfscCode("");
    setCardHolder("");
    setCardNumber("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState("processing");

    let details = {};
    if (activeTab === "upi") {
      if (!upiId.includes("@")) {
        setPaymentState("error");
        setErrorMessage("Please enter a valid UPI ID (e.g. name@okaxis)");
        return;
      }
      details = { upi_id: upiId };
    } else if (activeTab === "bank") {
      if (!bankName || !accountHolder || !accountNumber || !ifscCode) {
        setPaymentState("error");
        setErrorMessage("Please fill all bank account details.");
        return;
      }
      details = {
        bank_name: bankName,
        account_holder: accountHolder,
        account_number: accountNumber,
        ifsc_code: ifscCode,
      };
    } else if (activeTab === "card") {
      if (!cardHolder || cardNumber.length < 15) {
        setPaymentState("error");
        setErrorMessage("Please fill valid card payout details.");
        return;
      }
      details = {
        card_holder: cardHolder,
        card_number: cardNumber,
      };
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          amount: amount,
          method: activeTab.toUpperCase(),
          details: details,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal processing failed");

      setPaymentState("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3500);
    } catch (err: any) {
      setPaymentState("error");
      setErrorMessage(err.message || "Failed to process withdrawal request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Sidebar Info Area */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                W
              </div>
              <span className="font-bold text-xs tracking-wider uppercase text-slate-300">Secure Withdrawal</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Amount to withdraw</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">₹{amount}</h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full mb-4"></div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Deducted securely from your wallet balance. Processing times may vary by method.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-indigo-200">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[7px]">✓</span>
              <span>Direct Bank Settlement</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-200">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[7px]">✓</span>
              <span>Instant Admin Notification</span>
            </div>
          </div>
        </div>

        {/* Right Main Interface */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between bg-white relative">
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {paymentState === "idle" && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Select Payout Method</h3>
                
                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab("upi")}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeTab === "upi"
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100/70"
                    }`}
                  >
                    <QrCode className="w-4 h-4 mb-1" />
                    UPI
                  </button>

                  <button
                    onClick={() => setActiveTab("bank")}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeTab === "bank"
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100/70"
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1" />
                    Bank
                  </button>

                  <button
                    onClick={() => setActiveTab("card")}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeTab === "card"
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100/70"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1" />
                    Card
                  </button>
                </div>

                {/* Form fields based on tab */}
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  {activeTab === "upi" && (
                    <div className="space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">UPI ID / VPA</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. studentname@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Specify your Google Pay, PhonePe, or Paytm UPI handle.
                      </p>
                    </div>
                  )}

                  {activeTab === "bank" && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. SBI, HDFC"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
                          <input
                            type="text"
                            required
                            placeholder="SBIN0001234"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Name as in bank book"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="Your 11-16 digit bank number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "card" && (
                    <div className="space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number (Visa/Mastercard)</label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="Debit card number to credit"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-lg shadow-indigo-100 mt-6"
                  >
                    Submit Payout Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {paymentState === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">Verifying Balance...</h4>
              <p className="text-[11px] text-slate-400">Locking transaction and notifying platform admins.</p>
            </div>
          )}

          {paymentState === "success" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-2">Request Submitted!</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                Your withdrawal request has been submitted successfully! The funds will be credited to your account within **24-48 hours**.
              </p>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Admin has been alerted via email</span>
              </div>
            </div>
          )}

          {paymentState === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                <X className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Request Failed</h4>
              <p className="text-[11px] text-red-500 mb-6">{errorMessage}</p>
              <button
                onClick={() => setPaymentState("idle")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Footer security badge */}
          <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
            <span className="w-3.5 h-3.5 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-[7px] font-bold">✓</span>
            <span>SECURE PAYOUT GATEWAY</span>
          </div>

        </div>

      </div>
    </div>
  );
};
