import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  Percent,
  History,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Clock,
  Loader2
} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawType, setWithdrawType] = useState<"revenue" | "gst">("revenue");
  const [withdrawData, setWithdrawData] = useState({
    amount: 0,
    account_number: "",
    ifsc_code: "",
    holder_name: "",
  });

  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isProcessingPayout, setIsProcessingPayout] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "verifications" | "withdrawals">("stats");
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminStats();
    fetchPendingVerifications();
    fetchWithdrawalRequests();
    fetchAdminTransactions();
  }, []);

  const fetchAdminTransactions = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/withdrawal-requests");
      const data = await response.json();
      setWithdrawalRequests(data);
    } catch (err) {
      console.error("Failed to load withdrawal requests", err);
    }
  };

  const handleApprovePayout = async (id: number) => {
    setIsProcessingPayout(id);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/admin/withdrawal-requests/${id}/approve`, {
        method: "POST"
      });
      if (response.ok) {
        toast.success("Payout marked as completed successfully!");
        fetchWithdrawalRequests();
        fetchAdminStats();
      } else {
        toast.error("Failed to approve payout request.");
      }
    } catch (err) {
      toast.error("Failed to approve payout request.");
    } finally {
      setIsProcessingPayout(null);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/pending-verifications");
      const data = await response.json();
      setPendingStudents(data);
    } catch (err) {
      console.error("Failed to load verifications", err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoading(false);
    }
  };

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleAdminWithdraw = (type: "revenue" | "gst", amount: number) => {
    if (amount <= 0) {
      toast.error("Nothing to withdraw");
      return;
    }
    setWithdrawType(type);
    setWithdrawData({ ...withdrawData, amount: amount });
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: withdrawType, 
          amount: withdrawData.amount,
          bank_details: {
            account_number: withdrawData.account_number,
            ifsc_code: withdrawData.ifsc_code,
            holder_name: withdrawData.holder_name,
          }
        }),
      });

      if (response.ok) {
        toast.success(`₹${withdrawData.amount.toFixed(2)} withdrawal initiated!`);
        setShowWithdrawModal(false);
        fetchAdminStats();
      } else {
        toast.error("Withdrawal failed");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleVerifyStudent = async (studentId: number, status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setVerifyingId(studentId);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/admin/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          student_id: studentId, 
          status, 
          reason: rejectionReason 
        }),
      });

      if (response.ok) {
        toast.success(`Student ${status === "approved" ? "Approved" : "Rejected"}`);
        setRejectionReason("");
        fetchPendingVerifications();
        fetchAdminStats();
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setVerifyingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Admin</h1>
            <p className="text-slate-500 text-lg">Financial overview and marketplace health</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "stats" ? "default" : "outline"}
              onClick={() => setActiveTab("stats")}
              className={activeTab === "stats" ? "bg-indigo-600" : ""}
            >
              Dashboard Stats
            </Button>
            <Button 
              variant={activeTab === "verifications" ? "default" : "outline"}
              onClick={() => setActiveTab("verifications")}
              className={activeTab === "verifications" ? "bg-indigo-600 flex gap-2" : "flex gap-2"}
            >
              Verifications
              {pendingStudents.length > 0 && (
                <Badge className="bg-red-500 text-white border-none h-5 w-5 p-0 flex items-center justify-center">
                  {pendingStudents.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant={activeTab === "withdrawals" ? "default" : "outline"}
              onClick={() => setActiveTab("withdrawals")}
              className={activeTab === "withdrawals" ? "bg-indigo-600 flex gap-2" : "flex gap-2"}
            >
              Withdrawals
              {withdrawalRequests.length > 0 && (
                <Badge className="bg-amber-500 text-white border-none h-5 w-5 p-0 flex items-center justify-center">
                  {withdrawalRequests.length}
                </Badge>
              )}
            </Button>
            <Button onClick={() => { fetchAdminStats(); fetchPendingVerifications(); fetchWithdrawalRequests(); }} variant="ghost">
              Refresh
            </Button>
          </div>
        </div>

        {activeTab === "stats" && (
          <>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-900">₹{(stats?.total_fees + stats?.total_gst).toFixed(2)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 font-medium">Platform Fees + Collected GST</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Escrow Balance</p>
                  <p className="text-3xl font-black text-slate-900">₹{stats?.total_escrow.toFixed(2)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 font-medium">Money currently held by platform</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-black text-slate-900">{stats?.student_count + stats?.company_count}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-2xl">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">{stats?.student_count} Students</Badge>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">{stats?.company_count} Companies</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                  <p className="text-3xl font-black text-slate-900">{stats?.total_tasks}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-2xl">
                  <Briefcase className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 font-medium">Projects posted since launch</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Financials */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Fee Revenue</CardTitle>
                  <CardDescription>Platform commissions from both sides</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-2">
                <p className="text-5xl font-black text-indigo-600">₹{stats?.total_fees.toFixed(2)}</p>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Total Commissions</p>
              </div>
              <div className="mt-8 pt-8 border-t space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Average Fee per Task</span>
                  <span className="font-bold text-slate-900">10% (5% Recruiter + 5% Student)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Revenue Growth</span>
                  <Badge className="bg-green-100 text-green-700 border-none">+12.5% this week</Badge>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Available in Admin Main Bank Account
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Tax Collection</CardTitle>
                  <CardDescription>GST collected from recruiters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-2">
                <p className="text-5xl font-black text-blue-600">₹{stats?.total_gst.toFixed(2)}</p>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Total GST (18%)</p>
              </div>
              <div className="mt-8 pt-8 border-t space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">GST Compliance Status</span>
                  <Badge className="bg-blue-100 text-blue-700 border-none">Active</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Next Tax Filing</span>
                  <span className="font-bold text-slate-900">June 1st, 2026</span>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm shadow-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Reserved for Government Tax Filing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Placeholder */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-slate-400" />
              <CardTitle>Recent Marketplace Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No marketplace activity yet</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.transaction_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {tx.display_name ? tx.display_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.description || `${tx.type === 'credit' ? 'Deposit' : 'Payment'} by ${tx.display_name}`}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={tx.type === 'credit' ? 'text-green-600 border-green-200 bg-green-50/50' : 'text-indigo-600 border-indigo-200 bg-indigo-50/50'}>
                      ₹{tx.amount.toFixed(2)} {tx.type === 'credit' ? 'Deposited' : 'Locked/Paid'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </>
        )}
        
        {activeTab === "verifications" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Student Verification Center
              </h2>
              <p className="text-slate-500 mt-1">Review student IDs and approve them for marketplace access.</p>
            </div>

            {pendingStudents.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-slate-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500">No pending verification requests at the moment.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingStudents.map((student) => (
                  <Card key={student.student_id} className="overflow-hidden border-none shadow-md">
                    <div className="flex flex-col lg:flex-row">
                      {/* ID Preview */}
                      <div className="lg:w-1/3 bg-slate-100 p-4 flex items-center justify-center relative group">
                        <img 
                          src={student.id_card_url} 
                          alt="Student ID" 
                          className="max-h-64 object-contain rounded-lg shadow-sm"
                        />
                        <a 
                          href={student.id_card_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold rounded-lg"
                        >
                          <ExternalLink className="w-5 h-5" />
                          View Full Screen
                        </a>
                      </div>
                      
                      {/* Details & Actions */}
                      <div className="lg:w-2/3 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900">{student.first_name} {student.last_name}</h3>
                              <p className="text-indigo-600 font-bold">{student.email}</p>
                            </div>
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                              Class of {student.graduation_year}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] uppercase font-bold text-slate-400">University</p>
                              <p className="font-bold text-slate-700">{student.university}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Major</p>
                              <p className="font-bold text-slate-700">{student.major}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                              <Label className="text-xs text-slate-400 font-bold mb-1 block">REJECTION REASON (ONLY IF REJECTING)</Label>
                              <Input 
                                placeholder="e.g. ID Expired, Image Blurry..." 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="bg-slate-50"
                              />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              <Button 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50 flex-1 md:flex-none gap-2"
                                onClick={() => handleVerifyStudent(student.student_id, "rejected")}
                                disabled={verifyingId === student.student_id}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none gap-2"
                                onClick={() => handleVerifyStudent(student.student_id, "approved")}
                                disabled={verifyingId === student.student_id}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve Student
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Pending Student Payouts</h2>
              <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1 text-xs">
                {withdrawalRequests.length} Pending Approval
              </Badge>
            </div>

            {withdrawalRequests.length === 0 ? (
              <Card className="p-12 text-center border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 animate-pulse">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">All Clear!</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  There are no pending student withdrawal requests. All payouts have been successfully settled!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {withdrawalRequests.map((req) => (
                  <Card key={req.id} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* Left: Student Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-extrabold text-slate-800">
                            {req.first_name} {req.last_name}
                          </span>
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-wider text-[9px] px-2 py-0.5">
                            {req.method}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{req.email}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Requested on {new Date(req.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-[1.5] bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Payout Credentials
                        </span>
                        
                        {req.method === "UPI" && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">UPI ID / VPA:</span>
                              <span className="font-mono font-bold text-slate-700 select-all">{req.details?.upi_id}</span>
                            </div>
                          </div>
                        )}

                        {req.method === "BANK" && (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Bank Name:</span>
                              <span className="font-semibold text-slate-700">{req.details?.bank_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Holder Name:</span>
                              <span className="font-semibold text-slate-700">{req.details?.account_holder}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Account Number:</span>
                              <span className="font-mono font-bold text-slate-700 select-all">{req.details?.account_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">IFSC Code:</span>
                              <span className="font-mono font-bold text-slate-700 select-all uppercase">{req.details?.ifsc_code}</span>
                            </div>
                          </div>
                        )}

                        {req.method === "CARD" && (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Cardholder Name:</span>
                              <span className="font-semibold text-slate-700">{req.details?.card_holder}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Card Number:</span>
                              <span className="font-mono font-bold text-slate-700 select-all">{req.details?.card_number}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[150px]">
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                          <span className="text-2xl font-black text-slate-900">₹{req.amount}</span>
                        </div>
                        <Button
                          onClick={() => handleApprovePayout(req.id)}
                          disabled={isProcessingPayout === req.id}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-green-100 flex items-center gap-1.5"
                        >
                          {isProcessingPayout === req.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve Payout
                            </>
                          )}
                        </Button>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full shadow-2xl border-none">
              <CardHeader className="bg-indigo-900 text-white rounded-t-xl">
                <CardTitle>{withdrawType === "revenue" ? "Internal Transfer: Platform Revenue" : "Tax Compliance: Allocate GST Funds"}</CardTitle>
                <CardDescription className="text-indigo-100">
                  {withdrawType === "revenue" 
                    ? "Transfer accumulated commission profits from Escrow Holding Ledger to Admin Main Business Bank Account." 
                    : "Allocate collected GST tax funds from Escrow Holding Ledger for Government Tax Compliance Filing."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Withdrawal Amount (₹)</Label>
                    <div className="text-3xl font-black text-slate-900">₹{withdrawData.amount.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Business Account Holder Name</Label>
                      <Input 
                        placeholder="Legal entity name" 
                        value={withdrawData.holder_name}
                        onChange={(e) => setWithdrawData({ ...withdrawData, holder_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Account Number</Label>
                      <Input 
                        placeholder="Enter account number" 
                        value={withdrawData.account_number}
                        onChange={(e) => setWithdrawData({ ...withdrawData, account_number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input 
                        placeholder="e.g. HDFC0001234" 
                        className="uppercase"
                        value={withdrawData.ifsc_code}
                        onChange={(e) => setWithdrawData({ ...withdrawData, ifsc_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" type="button" className="flex-1" onClick={() => setShowWithdrawModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={isWithdrawing}>
                      {isWithdrawing ? "Processing..." : "Confirm Transfer"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
