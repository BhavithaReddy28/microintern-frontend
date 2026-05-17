import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export function Marketplace() {
  const { user, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/tasks");
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (taskId: number) => {
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
        description: "You must be a verified student to apply. Check your dashboard for status.",
      });
      return;
    }

    const clickedTask = tasks.find((task) => task.task_id === taskId);
    if (!clickedTask) return;

    if (clickedTask.applicants_count >= clickedTask.max_applicants) {
      toast.error("This task is no longer accepting applicants.");
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          student_id: user.profile_id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to apply");
      }

      toast.success("Application submitted successfully!");
      fetchTasks(); // Refresh tasks to show updated applicant count
    } catch (error) {
      toast.error("Could not submit application", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "payment-high") return b.payment - a.payment;
    if (sortBy === "payment-low") return a.payment - b.payment;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const categories = [
    "all",
    ...Array.from(new Set(tasks.map((task) => task.category))),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Task Marketplace</h1>
          </div>
          <p className="text-slate-600">
            Browse verified micro-internship opportunities from trusted companies
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="payment-high">
                      Payment: High to Low
                    </SelectItem>
                    <SelectItem value="payment-low">
                      Payment: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-500">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tasks...
            </div>
          ) : (
            <p>
              Showing <span className="font-semibold">{sortedTasks.length}</span>{" "}
              {sortedTasks.length === 1 ? "task" : "tasks"}
            </p>
          )}
        </div>

        {/* Task Grid */}
        <div className="grid gap-6">
          {sortedTasks.map((task) => (
            <Card
              key={task.task_id}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {task.company_name?.[0] || "C"}
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link
                            to={`/task/${task.task_id}`}
                            className="text-xl font-semibold hover:text-blue-600 transition-colors"
                          >
                            {task.title}
                          </Link>
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-slate-600 mb-3">{task.company_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{task.payment}
                        </div>
                        <div className="text-xs text-slate-500">
                          (Net: ₹{(task.payment * 0.95).toFixed(0)})
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge 
                        variant="secondary" 
                        className={
                          task.level === 'Easy' ? 'bg-green-100 text-green-700' :
                          task.level === 'Hard' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }
                      >
                        {task.level || 'Medium'}
                      </Badge>
                      <Badge variant="secondary">{task.category}</Badge>
                      {task.skills?.split(",").map((skill: string) => (
                        <Badge key={skill} variant="outline">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {task.applicants_count}/{task.max_applicants} applicants
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>5% platform fee</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-3">
                      <Button asChild className="flex-1 sm:flex-none">
                        <Link to={`/task/${task.task_id}`}>View Details</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none"
                        onClick={() => handleApply(task.task_id)}
                        disabled={task.applicants_count >= task.max_applicants}
                      >
                        {task.applicants_count >= task.max_applicants ? "Positions Filled" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && sortedTasks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-slate-600">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}