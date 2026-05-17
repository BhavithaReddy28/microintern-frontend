import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Briefcase,
  Users,
  DollarSign,
  CheckCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Award,
  Star,
  Loader2,
  Upload,
  Bell,
} from "lucide-react";
import { useRef } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  const [discoverStudents, setDiscoverStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
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

  const [readApplicantIds, setReadApplicantIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`readApplicants_${user?.user_id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const markApplicantAsRead = (appId: number) => {
    if (!readApplicantIds.includes(appId)) {
      const newReadIds = [...readApplicantIds, appId];
      setReadApplicantIds(newReadIds);
      localStorage.setItem(`readApplicants_${user?.user_id}`, JSON.stringify(newReadIds));
    }
  };

  const markAllApplicantsAsRead = () => {
    const allIds = allApplicants.filter(a => a.status === "pending").map(a => a.application_id);
    setReadApplicantIds(allIds);
    localStorage.setItem(`readApplicants_${user?.user_id}`, JSON.stringify(allIds));
  };

  const [newTask, setNewTask] = useState({
    title: "",
    category: "",
    description: "",
    payment: "",
    duration: "",
    max_applicants: "",
    skills: "",
    deadline: "",
    task_link: "",
    level: "Medium",
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchDiscoverStudents = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/students");
      const data = await response.json();
      if (response.ok) setDiscoverStudents(data);
    } catch (err) {
      console.error("Error fetching discover students:", err);
    }
  };

  useEffect(() => {
    if (user?.profile_id) {
      fetchCompanyTasks();
      fetchAllApplicants();
      fetchDiscoverStudents();
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const balRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/balance/${user.user_id}`);
      const balData = await balRes.json();
      setWalletBalance(balData.balance);

      const transRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/transactions/${user.user_id}`);
      const transData = await transRes.json();
      setTransactions(transData);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchAllApplicants = async () => {
    try {
      // Fetch tasks first to get their IDs
      const tasksResponse = await fetch(`${import.meta.env.VITE_API_URL}/company/${user?.profile_id}/tasks`);
      const tasksData = await tasksResponse.json();
      
      const applicantsPromises = tasksData.map((t: any) => 
        fetch(`${import.meta.env.VITE_API_URL}/tasks/${t.task_id}/applicants`).then(res => res.json())
      );
      
      const results = await Promise.all(applicantsPromises);
      const flattened = results.flat();
      setAllApplicants(flattened);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  const fetchCompanyTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/${user?.profile_id}/tasks`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const confirmAndPostTask = async () => {
    setIsPosting(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          company_id: user?.profile_id,
          payment: parseFloat(newTask.payment),
          max_applicants: parseInt(newTask.max_applicants),
        }),
      });

      if (response.ok) {
        toast.success("Task posted successfully! Payment processed.");
        setShowNewTaskForm(false);
        setShowPaymentModal(false);
        setNewTask({
          title: "",
          category: "",
          description: "",
          payment: "",
          duration: "",
          max_applicants: "",
          skills: "",
          deadline: "",
          task_link: "",
          level: "Medium",
        });
        fetchCompanyTasks();
        fetchWalletData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to post task");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleTopUp = async () => {
    const amount = prompt("Enter amount to top up (Real Gateway):", "500");
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      // 1. Fetch dynamic config and Create order
      const configRes = await fetch(import.meta.env.VITE_API_URL + "/payment/config");
      const configData = await configRes.json();
      const rzpKey = configData.razorpay_key_id;

      const orderRes = await fetch(import.meta.env.VITE_API_URL + "/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.message);

      // 2. Open Razorpay Checkout
      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: "INR",
        name: "MicroIntern Marketplace",
        description: "Wallet Top-up",
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          const verifyRes = await fetch(import.meta.env.VITE_API_URL + "/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.user_id,
              amount: Number(amount)
            }),
          });

          if (verifyRes.ok) {
            toast.success(`₹${amount} added via Razorpay!`);
            fetchWalletData();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      toast.error("Payment initialization failed: " + err.message);
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
        setNewTask({ ...newTask, task_link: data.url });
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

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchAllApplicants();
        fetchCompanyTasks();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRateStudent = async (studentId: number, rating: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${studentId}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (response.ok) {
        fetchDiscoverStudents();
        fetchAllApplicants();
      }
    } catch (err) {
      console.error("Error rating student:", err);
    }
  };

  const handleInviteStudent = async (studentId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${studentId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: "The Recruiter" }), // You could fetch actual company name here
      });
      if (response.ok) {
        alert("Interview invitation sent via email!");
      }
    } catch (err) {
      console.error("Error inviting student:", err);
    }
  };

  // Calculate stats
  const activeTasksCount = tasks.length;
  const totalApplicants = allApplicants.length;
  const baseBudget = tasks.reduce(
    (sum, task) => sum + Number(task.payment || 0),
    0
  );
  const platformFee = baseBudget * 0.05;
  const gstAmount = baseBudget * 0.18;
  const totalBudget = baseBudget + platformFee + gstAmount;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
              <p className="text-green-100">
                Manage your tasks and connect with talented students
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative" title="New applications pending" ref={notificationRef}>
                <div 
                  className="cursor-pointer group flex items-center"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-6 h-6 text-white hover:text-green-200 transition-colors" />
                  {allApplicants.filter(a => a.status === "pending" && !readApplicantIds.includes(a.application_id)).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-emerald-600">
                      {allApplicants.filter(a => a.status === "pending" && !readApplicantIds.includes(a.application_id)).length}
                    </span>
                  )}
                </div>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden text-slate-800">
                    <div className="p-3 bg-slate-50 border-b font-semibold flex justify-between items-center">
                      <span>Recent Applications</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {allApplicants.filter(a => a.status === "pending" && !readApplicantIds.includes(a.application_id)).length} New
                      </Badge>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {allApplicants.filter(a => a.status === "pending" && !readApplicantIds.includes(a.application_id)).length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No new applications pending.</div>
                      ) : (
                        allApplicants.filter(a => a.status === "pending" && !readApplicantIds.includes(a.application_id)).map(app => (
                          <div 
                            key={app.application_id} 
                            className="p-4 border-b hover:bg-slate-50 last:border-0 transition-colors cursor-pointer"
                            onClick={() => {
                              setShowNotifications(false);
                              markApplicantAsRead(app.application_id);
                              setActiveTab("applicants");
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                              <p className="font-medium text-sm">{app.first_name} {app.last_name}</p>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                              <span className="truncate max-w-[150px]">
                                {tasks.find(t => t.task_id === app.task_id)?.title || "Task #" + app.task_id}
                              </span>
                              <span className="text-emerald-600 font-medium">Pending</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div 
                      className="p-3 text-center bg-slate-50 border-t hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        markAllApplicantsAsRead();
                        setActiveTab("applicants");
                      }}
                    >
                      <span className="text-xs font-semibold text-emerald-600 w-full block">
                        Review All Applicants
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="bg-white text-green-700 hover:bg-green-50"
                onClick={() => setShowNewTaskForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("tasks")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Tasks</p>
                  <p className="text-2xl font-bold">{activeTasksCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("applicants")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Applicants</p>
                  <p className="text-2xl font-bold">{totalApplicants}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("wallet")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalBudget.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("wallet")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Platform Fee + GST</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{(platformFee + gstAmount).toFixed(2)}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Task Form Modal */}
        {showNewTaskForm && (
          <Card className="mb-8 border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Post New Task</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}
              <form onSubmit={handlePostTask} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Social Media Manager"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Marketing"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Difficulty Level</Label>
                    <select
                      id="level"
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={newTask.level}
                      onChange={(e) => setNewTask({ ...newTask, level: e.target.value })}
                      required
                    >
                      <option value="Easy">Easy (Beginner friendly)</option>
                      <option value="Medium">Medium (Standard)</option>
                      <option value="Hard">Hard (Advanced skills required)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the task requirements and objectives..."
                    rows={4}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="payment">Payment (₹)</Label>
                    <Input
                      id="payment"
                      type="number"
                      placeholder="300"
                      min="0"
                      value={newTask.payment}
                      onChange={(e) => setNewTask({ ...newTask, payment: e.target.value })}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      5% platform fee applies
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2 weeks"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxApplicants">Max Applicants</Label>
                    <Input
                      id="maxApplicants"
                      type="number"
                      placeholder="5"
                      min="1"
                      value={newTask.max_applicants}
                      onChange={(e) => setNewTask({ ...newTask, max_applicants: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Python, Data Analysis, Communication"
                    value={newTask.skills}
                    onChange={(e) => setNewTask({ ...newTask, skills: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task_link">Task Resource Link (Optional)</Label>
                      <Input 
                        id="task_link" 
                        placeholder="e.g. https://github.com/docs" 
                        value={newTask.task_link} 
                        onChange={(e) => setNewTask({ ...newTask, task_link: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task_file">OR Upload Resource File</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="task_file" 
                          type="file" 
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        {isUploading && <Loader2 className="w-4 h-4 animate-spin mt-3" />}
                      </div>
                      <p className="text-[10px] text-slate-500">Max size 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTaskForm(false)}
                    disabled={isPosting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="discover">Discover Talent</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Tasks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Active Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                      <p className="text-slate-500 italic">No tasks posted yet.</p>
                    ) : (
                      tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.task_id}
                          className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <span className="text-green-600 font-semibold">
                              ₹{task.payment}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              {task.applicants_count}/{task.max_applicants} applicants
                            </span>
                            <Badge variant="outline">{task.category}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setActiveTab("tasks")}
                  >
                    View All Tasks
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Base Task Payments</p>
                      <p className="text-2xl font-bold">₹{baseBudget.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Fees & GST (23%)</p>
                      <p className="text-2xl font-bold">₹{(platformFee + gstAmount).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Total Locked Capital</p>
                      <p className="text-2xl font-bold">₹{totalBudget.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Loading tasks...</p>
                  ) : tasks.length === 0 ? (
                    <p className="text-slate-500 italic">No tasks posted yet.</p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.task_id}
                        className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {task.title}
                              </h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-3">
                              {task.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {task.applicants_count}/{task.max_applicants} applicants
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₹{task.payment}
                              </span>
                              <Badge variant="outline">{task.category}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/task/${task.task_id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>Review Applicants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {allApplicants.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-8">
                      No applications received yet.
                    </p>
                  ) : (
                    allApplicants.map((app) => (
                      <div key={app.application_id} className="p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{app.first_name} {app.last_name}</h3>
                            <p className="text-sm text-slate-600">{app.university} • {app.major}</p>
                            <p className="text-xs text-blue-600 mt-1">Applied for: {tasks.find(t => t.task_id === app.task_id)?.title || "Task #" + app.task_id}</p>
                          </div>
                          <Badge variant="outline">{app.status}</Badge>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <a 
                              href={app.resume_url || "#"} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!app.resume_url) {
                                  e.preventDefault();
                                  alert("This student hasn't uploaded a resume yet.");
                                }
                              }}
                            >
                              View Resume
                            </a>
                          </Button>

                          {app.status === "submitted" && (
                            <div className="flex gap-2 items-center">
                              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <a href={app.submission_link} target="_blank" rel="noopener noreferrer">
                                  Review Work
                                </a>
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(app.application_id, "completed")}>
                                Mark as Completed
                              </Button>
                            </div>
                          )}

                          {app.status === "pending" && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => handleStatusUpdate(app.application_id, "accepted")}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(app.application_id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="discover">
            <Card>
              <CardHeader>
                <CardTitle>Talent Discovery</CardTitle>
                <CardDescription>Browse top-rated students and invite them to your team.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discoverStudents.map((student) => (
                    <div key={student.student_id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{student.first_name} {student.last_name}</h3>
                            {student.hireable && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">🔥 Top Talent</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{student.university} • {student.major}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="ml-1 text-sm font-bold">{student.rating}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{student.level || "Beginner"}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-col items-end mr-4">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rate Student</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star} 
                                onClick={() => handleRateStudent(student.student_id, star)}
                                className={`${star <= student.rating ? "text-amber-500" : "text-slate-300"} hover:text-amber-400 transition-colors`}
                              >
                                <Star className={`w-5 h-5 ${star <= student.rating ? "fill-current" : ""}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleInviteStudent(student.student_id)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Invite to Interview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Business Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-4">₹{walletBalance.toFixed(2)}</div>
                  <Button className="w-full bg-white text-indigo-600 hover:bg-slate-100 border-none" onClick={handleTopUp}>
                    Top Up Wallet
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <p className="text-slate-500 italic text-center py-8">No payments yet.</p>
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
        </Tabs>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Confirm Payment</CardTitle>
                <CardDescription>Review the task cost before posting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Task Payment</span>
                    <span>₹{newTask.payment}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee (5%)</span>
                    <span>₹{(Number(newTask.payment) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{(Number(newTask.payment) * 0.18).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{(Number(newTask.payment) * 1.23).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p>The total amount will be deducted from your business wallet and held until the task is completed by the student.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={confirmAndPostTask} disabled={isPosting}>
                    {isPosting ? "Processing..." : "Pay & Post Task"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}