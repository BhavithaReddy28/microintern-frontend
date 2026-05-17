import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Briefcase,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Building2,
  AlertCircle,
  Loader2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState("");

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setIsLoading(true);
    try {
      const url = user?.profile_id && user.role === "student"
        ? `${import.meta.env.VITE_API_URL}/tasks/${id}?student_id=${user.profile_id}`
        : `${import.meta.env.VITE_API_URL}/tasks/${id}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setTask(data);
      } else {
        toast.error("Task not found");
      }
    } catch (err) {
      console.error("Error fetching task:", err);
      toast.error("Failed to load task details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for tasks");
      return;
    }

    if (user.role !== "student") {
      toast.error("Only students can apply for tasks");
      return;
    }

    // Force refresh verification status if not already approved
    let currentStatus = user.verification_status;
    if (currentStatus !== "approved") {
      try {
        const checkRes = await fetch(`${import.meta.env.VITE_API_URL}/student/${user.profile_id}`);
        const checkData = await checkRes.json();
        if (checkRes.ok && checkData.verification_status === "approved") {
          currentStatus = "approved";
          // Update local state so they don't have to fetch again
          const updatedUser = { ...user, verification_status: "approved" as const };
          login(updatedUser);
        }
      } catch (err) {
        console.error("Failed to refresh status:", err);
      }
    }

    if (currentStatus !== "approved") {
      toast.error("Account Not Verified", {
        description: "You must be a verified student to apply. Please check your dashboard for status or wait for admin approval.",
      });
      return;
    }

    if (task.applicants_count >= task.max_applicants) {
      toast.error("This task is no longer accepting applicants.");
      return;
    }

    try {
      setIsApplying(true);
      const response = await fetch(import.meta.env.VITE_API_URL + "/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: Number(id),
          student_id: user.profile_id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to apply");
      }

      toast.success("Application submitted successfully!");
      fetchTask(); // Refresh to update applicant count
    } catch (error) {
      toast.error("Could not submit application", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsApplying(false);
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

  const handleTaskSubmit = async () => {
    if (!task?.application_id || !submissionLink) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${task.application_id}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_link: submissionLink }),
      });
      if (response.ok) {
        toast.success("Task submitted for review!");
        setShowSubmitModal(false);
        setSubmissionLink("");
        fetchTask();
      } else {
        toast.error("Failed to submit task");
      }
    } catch (err) {
      console.error("Error submitting task:", err);
      toast.error("An error occurred during submission");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
            <p className="text-slate-600 mb-6">
              The task you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/marketplace">Browse All Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicantsPercentage = (task.applicants_count / task.max_applicants) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {task.company_name?.[0] || "C"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-lg text-slate-600 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {task.company_name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ₹{task.payment}
              </div>
              <div className="text-sm text-slate-500">
                Net: ₹{(task.payment * 0.95).toFixed(0)} (5% fee)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Information */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="font-semibold">{task.duration}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Deadline</span>
                    </div>
                    <p className="font-semibold">{new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Positions</span>
                    </div>
                    <p className="font-semibold">{task.max_applicants}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Difficulty</span>
                    </div>
                    <Badge
                      className={
                        task.level === 'Easy' ? 'bg-green-100 text-green-700' :
                        task.level === 'Hard' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }
                    >
                      {task.level || 'Medium'}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Category</span>
                    </div>
                    <Badge>{task.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Task Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  {task.description}
                </p>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.skills?.split(",").map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Task Payment</span>
                    <span className="font-semibold">₹{task.payment}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">
                      Platform Commission (5%)
                    </span>
                    <span className="text-slate-600">
                      -₹{(task.payment * 0.05).toFixed(0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">You Receive</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{(task.payment * 0.95).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Apply for this Task</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Applicants</span>
                      <span className="font-semibold">
                        {task.applicants_count} / {task.max_applicants}
                      </span>
                    </div>
                    <Progress value={applicantsPercentage} />
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleApply} 
                    disabled={isApplying || task.applicants_count >= task.max_applicants || task.application_status}
                  >
                    {task.application_status 
                      ? `Status: ${task.application_status}` 
                      : task.applicants_count >= task.max_applicants 
                        ? "Positions Filled" 
                        : isApplying ? "Applying..." : "Apply Now"}
                  </Button>

                  {task.application_status === "accepted" && (
                    <div className="flex flex-col gap-2 pt-2">
                      {task.task_link && (
                        <Button asChild variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" size="lg">
                          <a href={task.task_link} target="_blank" rel="noopener noreferrer">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Start Working
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50" 
                        size="lg"
                        onClick={() => setShowSubmitModal(true)}
                      >
                        Submit Your Work
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {task.company_name?.[0] || "C"}
                    </div>
                    <div>
                      <p className="font-semibold">{task.company_name}</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-600">
                          Verified Company
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Posted on</p>
                    <p className="font-semibold">{new Date(task.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
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
                <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                <Button onClick={handleTaskSubmit} disabled={!submissionLink || isUploading}>Submit for Review</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

