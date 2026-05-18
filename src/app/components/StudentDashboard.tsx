import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Target,
  Zap,
  Trophy,
  Star,
  FileText,
  Loader2,
  Upload,
  Bell,
} from "lucide-react";
import { useRef } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { PaymentGatewayModal } from "./PaymentGatewayModal";
import { WithdrawalModal } from "./WithdrawalModal";

export function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingAppId, setSubmittingAppId] = useState<number | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    account_number: "",
    ifsc_code: "",
    holder_name: "",
  });
  const [availableTasksCount, setAvailableTasksCount] = useState(0);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [readTaskIds, setReadTaskIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`readTasks_${user?.user_id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const markTaskAsRead = (taskId: number) => {
    if (!readTaskIds.includes(taskId)) {
      const newReadIds = [...readTaskIds, taskId];
      setReadTaskIds(newReadIds);
      localStorage.setItem(`readTasks_${user?.user_id}`, JSON.stringify(newReadIds));
    }
  };

  const markAllTasksAsRead = () => {
    const allIds = availableTasks.map(t => t.task_id);
    setReadTaskIds(allIds);
    localStorage.setItem(`readTasks_${user?.user_id}`, JSON.stringify(allIds));
  };

  useEffect(() => {
    if (user?.profile_id) {
      fetchApplications();
      fetchProfile();
      fetchWalletData();
      fetchAvailableTasks();
    }
  }, [user]);

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/tasks");
      const data = await response.json();
      if (response.ok) {
        setAvailableTasksCount(data.length);
        setAvailableTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchWalletData = async () => {
    if (!user?.user_id) return;
    try {
      const balRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/balance/${user.user_id}`);
      const balData = await balRes.json();
      if (balRes.ok) {
        setWalletBalance(Number(balData.balance || 0));
      }

      const transRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/transactions/${user.user_id}`);
      const transData = await transRes.json();
      if (transRes.ok) {
        setTransactions(Array.isArray(transData) ? transData : []);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchProfile = async () => {
    if (!user?.profile_id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${user.profile_id}`);
      const data = await response.json();
      if (response.ok && data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${user?.profile_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setProfile(formData);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchApplications = async () => {
    if (!user?.profile_id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${user.profile_id}/applications`);
      const data = await response.json();
      if (response.ok) {
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (!submittingAppId || !submissionLink) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${submittingAppId}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_link: submissionLink }),
      });
      if (response.ok) {
        setSubmittingAppId(null);
        setSubmissionLink("");
        fetchApplications();
        toast.success("Task submitted for review!");
      } else {
        toast.error("Failed to submit task");
      }
    } catch (err) {
      console.error("Error submitting task:", err);
      toast.error("An error occurred during submission");
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSubmissionLink(data.url);
        toast.success("File uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({ ...formData, resume_url: data.url });
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error(data.message || "Resume upload failed");
      }
    } catch (err) {
      toast.error("Error uploading resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleTopUp = async () => {
    const amount = prompt("Enter amount to top up (Real Gateway):", "1000");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setPaymentAmount(Number(amount));
    setIsPaymentModalOpen(true);
  };

  const handleWithdrawClick = async () => {
    const amount = prompt("Enter amount to withdraw:", "500");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (Number(amount) > walletBalance) {
      toast.error(`Insufficient balance. You only have ₹${walletBalance.toFixed(2)} available.`);
      return;
    }
    setWithdrawAmount(Number(amount));
    setShowWithdrawModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Calculate stats
  const totalEarnings = applications
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (Number(a.payment || 0) * 0.95), 0);
  const completedTasks = applications.filter(
    (a) => a.status === "completed"
  ).length;
  const pendingApplications = applications.filter(
    (a) => a.status === "pending"
  ).length;
  const activeTasks = applications.filter(
    (a) => a.status === "accepted"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
              <p className="text-blue-100">
                Welcome back! Track your applications and earnings
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative" title="New tasks available" ref={notificationRef}>
                <div 
                  className="cursor-pointer group flex items-center"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-6 h-6 text-white hover:text-blue-200 transition-colors" />
                  {availableTasks.filter(t => !readTaskIds.includes(t.task_id)).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-indigo-600">
                      {availableTasks.filter(t => !readTaskIds.includes(t.task_id)).length}
                    </span>
                  )}
                </div>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b font-semibold text-slate-800 flex justify-between items-center">
                      <span>Available Tasks</span>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                        {availableTasks.filter(t => !readTaskIds.includes(t.task_id)).length} New
                      </Badge>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {availableTasks.filter(t => !readTaskIds.includes(t.task_id)).length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No new tasks available at the moment.</div>
                      ) : (
                        availableTasks.filter(t => !readTaskIds.includes(t.task_id)).map(task => (
                          <Link 
                            to={`/task/${task.task_id}`} 
                            key={task.task_id} 
                            className="block p-4 border-b hover:bg-slate-50 last:border-0 transition-colors"
                            onClick={() => {
                              setShowNotifications(false);
                              markTaskAsRead(task.task_id);
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <p className="font-medium text-slate-800 text-sm">{task.title}</p>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                              <span>{task.company_name}</span>
                              <span className="text-green-600 font-medium">₹{task.payment}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center bg-slate-50 border-t hover:bg-slate-100 transition-colors">
                      <Link 
                        to="/marketplace" 
                        className="text-xs font-semibold text-indigo-600 w-full block"
                        onClick={() => {
                          setShowNotifications(false);
                          markAllTasksAsRead();
                        }}
                      >
                        View All in Marketplace
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="border-white text-white bg-transparent hover:bg-white/10"
                asChild
              >
                <Link to="/marketplace">Browse Tasks</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("wallet")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalEarnings.toFixed(0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("applications")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completed Tasks</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("wallet")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{walletBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("profile")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Rating</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.rating || "0.0"} / 5.0</div>
              <p className="text-xs text-slate-500">Based on recruiter feedback</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("rank")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700">Student Rank</CardTitle>
              <Trophy className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">{profile?.level || "Beginner"}</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-end text-[9px] text-slate-500 uppercase tracking-tighter font-bold mb-1">
                  <span>Progress to {profile?.level === 'Expert' ? 'Master' : profile?.level === 'Intermediate' ? 'Expert' : 'Intermediate'}</span>
                  <span className="text-indigo-600">{profile?.points || 0} / {
                    profile?.level === 'Master' ? 'MAX' : 
                    profile?.level === 'Expert' ? '50' : 
                    profile?.level === 'Intermediate' ? '25' : '10'
                  } PTS</span>
                </div>
                <Progress 
                  value={
                    !profile ? 0 :
                    profile?.level === 'Master' ? 100 : 
                    profile?.level === 'Expert' ? (((profile?.points || 25) - 25) / 25) * 100 : 
                    profile?.level === 'Intermediate' ? (((profile?.points || 10) - 10) / 15) * 100 : 
                    ((profile?.points || 0) / 10) * 100
                  } 
                  className="h-1.5 bg-indigo-100"
                />
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  {profile?.level === 'Master' ? "Maximum rank achieved!" : "Complete Medium or Hard tasks to level up."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 overflow-x-auto whitespace-nowrap max-w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="rank">Progression</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : applications.length === 0 ? (
                      <p className="text-slate-500 italic">No applications yet.</p>
                    ) : (
                      applications.slice(0, 5).map((app) => (
                        <div
                          key={app.application_id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{app.task_title}</p>
                            <p className="text-sm text-slate-600">{app.company_name}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                            {app.status === "accepted" && app.task_link && (
                              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-[10px]">
                                <a href={app.task_link} target="_blank" rel="noopener noreferrer">
                                  Start Working
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setActiveTab("applications")}
                  >
                    View All Applications
                  </Button>
                </CardContent>
              </Card>

              {/* Earnings Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Total Earned (Net)</span>
                        <span className="font-semibold">₹{totalEarnings.toFixed(0)}</span>
                      </div>
                      <Progress value={Math.min((totalEarnings / 10000) * 100, 100)} />
                      <p className="text-xs text-slate-500 mt-1">Progress towards ₹10,000 goal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Loading applications...</p>
                  ) : applications.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-8">
                      You haven't applied for any tasks yet.
                    </p>
                  ) : (
                    applications.map((app) => (
                      <div
                        key={app.application_id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 mb-3 sm:mb-0">
                          <h3 className="font-semibold mb-1">{app.task_title}</h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {app.company_name}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                            <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-green-600 font-semibold">
                              ₹{app.payment}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                          {app.status === "accepted" && app.task_link && (
                            <div className="flex gap-2">
                              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-[10px]">
                                <a href={app.task_link} target="_blank" rel="noopener noreferrer">
                                  Start Working
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-[10px] border-indigo-600 text-indigo-600" onClick={() => setSubmittingAppId(app.application_id)}>
                                Submit Work
                              </Button>
                            </div>
                          )}
                        </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/task/${app.task_id}`}>View Task</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-4">₹{walletBalance.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-white text-indigo-600 hover:bg-slate-100 border-none" onClick={handleTopUp}>
                      Add Funds
                    </Button>
                    <Button variant="outline" className="flex-1 border-white text-white bg-transparent hover:bg-white/10" onClick={handleWithdrawClick}>
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <p className="text-slate-500 italic text-center py-8">No transactions yet.</p>
                    ) : (
                      transactions.map((t) => (
                        <div key={t.transaction_id} className="flex justify-between items-center p-3 border-b last:border-0">
                          <div>
                            <p className="font-semibold">{t.description}</p>
                            <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</p>
                          </div>
                          <div className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.email[0].toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold mb-1">{user?.email.split('@')[0]}</h2>
                    <Badge className="bg-green-100 text-green-800 mb-4">
                      Verified Student
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Profile Information</span>
                      {!editMode && (
                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                          Edit Portfolio
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input className="w-full p-2 border rounded" value={formData.first_name || ""} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input className="w-full p-2 border rounded" value={formData.last_name || ""} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">University</label>
                            <input className="w-full p-2 border rounded" value={formData.university || ""} onChange={e => setFormData({...formData, university: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Major</label>
                            <input className="w-full p-2 border rounded" value={formData.major || ""} onChange={e => setFormData({...formData, major: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bio / About Me</label>
                          <textarea className="w-full p-2 border rounded" rows={3} value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell recruiters about yourself..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium block">Resume (File Upload or Link)</label>
                            <div className="space-y-2">
                              <input 
                                className="w-full p-2 border rounded" 
                                value={formData.resume_url || ""} 
                                onChange={e => setFormData({...formData, resume_url: e.target.value})} 
                                placeholder="Link to your resume (Drive/Dropbox)" 
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">OR</span>
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 inline-flex">
                                  <Upload className="w-3 h-3" />
                                  {isUploadingResume ? "Uploading..." : "Upload PDF/Word"}
                                  <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="hidden" 
                                    onChange={handleResumeUpload}
                                    disabled={isUploadingResume}
                                  />
                                </label>
                                {isUploadingResume && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">GitHub URL</label>
                            <input className="w-full p-2 border rounded" value={formData.github_url || ""} onChange={e => setFormData({...formData, github_url: e.target.value})} />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                          <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save Portfolio"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-semibold text-slate-500 block">Name</label>
                            <p className="text-lg font-medium">{profile?.first_name} {profile?.last_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-slate-500 block">Email</label>
                            <p className="text-lg">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-slate-500 block">University</label>
                            <p className="text-lg">{profile?.university}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-slate-500 block">Major</label>
                            <p className="text-lg">{profile?.major}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-slate-500 block">Bio</label>
                          <p className="text-slate-700 leading-relaxed">
                            {profile?.bio || "No bio added yet. Tell recruiters about your skills and goals!"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                          {profile?.resume_url && (
                            <Button asChild variant="outline" size="sm">
                              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                View Resume
                              </a>
                            </Button>
                          )}
                          {profile?.github_url && (
                            <Button asChild variant="outline" size="sm">
                              <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                GitHub
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rank & Progression Tab */}
          <TabsContent value="rank">
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Trophy className="w-48 h-48" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="w-full">
                      <h2 className="text-3xl font-bold mb-2">Student Rank: {profile?.level || "Beginner"}</h2>
                      <p className="text-indigo-100 max-w-lg mb-6">
                        Complete tasks to earn points and level up! Higher ranks unlock premium tasks, better pay, and priority application reviews.
                      </p>
                      
                      <div className="w-full max-w-md bg-indigo-900/40 rounded-xl p-4 backdrop-blur-sm border border-indigo-500/30">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium text-indigo-100">Current Points</span>
                          <span className="text-xl font-bold text-white">{profile?.points || 0} PTS</span>
                        </div>
                        <Progress 
                          value={
                            !profile ? 0 :
                            profile?.level === 'Master' ? 100 : 
                            profile?.level === 'Expert' ? (((profile?.points || 25) - 25) / 25) * 100 : 
                            profile?.level === 'Intermediate' ? (((profile?.points || 10) - 10) / 15) * 100 : 
                            ((profile?.points || 0) / 10) * 100
                          } 
                          className="h-2 bg-indigo-900/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-emerald-400"
                        />
                        <p className="text-xs text-indigo-200 mt-2 text-right">
                          {profile?.level === 'Master' ? "You've reached the top!" : `Keep completing tasks to reach the next rank.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { name: "Beginner", pts: "0 - 9", desc: "Start your journey. Access to Easy tier tasks.", icon: Star, color: "text-slate-600", bg: "bg-slate-100", active: profile?.level === 'Beginner' || !profile?.level },
                  { name: "Intermediate", pts: "10 - 24", desc: "Access to Medium tier tasks and 5% earning bonus.", icon: Zap, color: "text-blue-600", bg: "bg-blue-100", active: profile?.level === 'Intermediate' },
                  { name: "Expert", pts: "25 - 49", desc: "Access to Hard tasks, 10% earning bonus, priority review.", icon: Award, color: "text-purple-600", bg: "bg-purple-100", active: profile?.level === 'Expert' },
                  { name: "Master", pts: "50+", desc: "Exclusive invites, 15% bonus, direct chat with recruiters.", icon: Trophy, color: "text-amber-500", bg: "bg-amber-100", active: profile?.level === 'Master' }
                ].map((rank, idx) => (
                  <Card key={idx} className={`relative overflow-hidden transition-all ${rank.active ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'opacity-70 grayscale-[50%]'}`}>
                    {rank.active && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                        CURRENT
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${rank.bg}`}>
                        <rank.icon className={`w-5 h-5 ${rank.color}`} />
                      </div>
                      <CardTitle className="text-lg">{rank.name}</CardTitle>
                      <div className="text-xs font-bold text-slate-500">{rank.pts} PTS</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-snug">{rank.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submission Dialog (Simple Overlay) */}
        {submittingAppId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Submission Link (GitHub, Drive, etc.)</Label>
                  <Input 
                    placeholder="https://..." 
                    value={submissionLink} 
                    onChange={(e) => setSubmissionLink(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>OR Upload Completed Work File</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="file" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin mt-3" />}
                  </div>
                  <p className="text-[10px] text-slate-500">Maximum size: 10MB</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => setSubmittingAppId(null)}>Cancel</Button>
                  <Button onClick={handleTaskSubmit} disabled={!submissionLink || isUploading}>
                    {isUploading ? "Uploading..." : "Submit for Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showWithdrawModal && (
          <WithdrawalModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            amount={withdrawAmount}
            userId={Number(user?.user_id)}
            onSuccess={() => {
              toast.success(`Withdrawal of ₹${withdrawAmount} requested! Processing starts immediately.`);
              fetchWalletData();
            }}
          />
        )}

        {isPaymentModalOpen && (
          <PaymentGatewayModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            amount={paymentAmount}
            userId={Number(user?.user_id)}
            onSuccess={(addedAmount) => {
              toast.success(`₹${addedAmount} added successfully!`);
              fetchWalletData();
            }}
          />
        )}
      </div>
    </div>
  );
}