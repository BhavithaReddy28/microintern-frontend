import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Upload,
  Link2,
  FileText,
  Sparkles,
  CheckCircle,
  X,
  Github,
  Linkedin,
  Globe,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface PortfolioData {
  name: string;
  bio: string;
  resumeFile: File | null;
  portfolioLink: string;
  githubLink: string;
  linkedinLink: string;
  projects: Array<{ title: string; description: string; skills: string[] }>;
  detectedSkills: string[];
}

export function PortfolioUpload({
  onComplete,
}: {
  onComplete: (skills: string[]) => void;
}) {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    name: "",
    bio: "",
    resumeFile: null,
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    projects: [],
    detectedSkills: [],
  });

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills: "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolio({ ...portfolio, resumeFile: file });
      toast.success("Resume uploaded successfully!");
    }
  };

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const skillsArray = newProject.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      setPortfolio({
        ...portfolio,
        projects: [
          ...portfolio.projects,
          {
            title: newProject.title,
            description: newProject.description,
            skills: skillsArray,
          },
        ],
      });
      setNewProject({ title: "", description: "", skills: "" });
      toast.success("Project added!");
    }
  };

  const removeProject = (index: number) => {
    const updated = portfolio.projects.filter((_, i) => i !== index);
    setPortfolio({ ...portfolio, projects: updated });
  };

  const analyzePortfolio = () => {
    setAnalyzing(true);

    // Simulate AI skill detection
    setTimeout(() => {
      const allSkills = new Set<string>();

      // Extract from bio
      const bioSkills = extractSkillsFromText(portfolio.bio);
      bioSkills.forEach((skill) => allSkills.add(skill));

      // Extract from projects
      portfolio.projects.forEach((project) => {
        project.skills.forEach((skill) => allSkills.add(skill));
        const descSkills = extractSkillsFromText(project.description);
        descSkills.forEach((skill) => allSkills.add(skill));
      });

      // Extract from links (simulate GitHub analysis)
      if (portfolio.githubLink) {
        ["Git", "Open Source", "Collaboration"].forEach((skill) =>
          allSkills.add(skill)
        );
      }

      const detectedSkills = Array.from(allSkills);
      setPortfolio({ ...portfolio, detectedSkills });
      setAnalyzing(false);
      setStep(3);
      toast.success(
        `Portfolio analyzed! ${detectedSkills.length} skills detected.`
      );
    }, 2000);
  };

  const extractSkillsFromText = (text: string): string[] => {
    const skillKeywords = [
      "Python",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "HTML",
      "CSS",
      "Java",
      "C++",
      "SQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Git",
      "Machine Learning",
      "Data Analysis",
      "UI/UX",
      "Figma",
      "Adobe",
      "Photoshop",
      "Marketing",
      "Content Writing",
      "SEO",
      "Social Media",
      "Excel",
      "PowerPoint",
      "Research",
      "Communication",
      "Leadership",
      "Problem Solving",
      "Teamwork",
      "Project Management",
      "Agile",
      "Scrum",
      "REST API",
      "GraphQL",
      "Firebase",
      "TensorFlow",
      "PyTorch",
      "Pandas",
      "NumPy",
      "Data Visualization",
      "Tableau",
      "Business Analysis",
      "Video Editing",
      "Photography",
      "Canva",
      "Copywriting",
    ];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    skillKeywords.forEach((skill) => {
      if (lowerText.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    });

    return found;
  };

  const completeSetup = () => {
    onComplete(portfolio.detectedSkills);
    toast.success("Portfolio setup complete! Finding matching tasks...");
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-semibold">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-slate-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all ${
                  step >= 2 ? "w-full" : "w-0"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <span className="font-semibold">Portfolio</span>
            </div>
            <div className="flex-1 h-1 bg-slate-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all ${
                  step >= 3 ? "w-full" : "w-0"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                3
              </div>
              <span className="font-semibold">Skills Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tell Us About Yourself
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={portfolio.name}
                onChange={(e) =>
                  setPortfolio({ ...portfolio, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio / Introduction</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, skills, and what you're looking for... (mention your technical skills, tools you use, etc.)"
                rows={5}
                value={portfolio.bio}
                onChange={(e) =>
                  setPortfolio({ ...portfolio, bio: e.target.value })
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Mention specific skills and technologies you know. Our AI
                will detect them!
              </p>
            </div>

            <div>
              <Label htmlFor="resume">Upload Resume (Optional)</Label>
              <div className="mt-2">
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">
                    {portfolio.resumeFile
                      ? portfolio.resumeFile.name
                      : "Click to upload PDF or DOCX"}
                  </span>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!portfolio.name || !portfolio.bio}
            >
              Continue to Portfolio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Portfolio Links & Projects */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Portfolio Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolio" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Portfolio Website
                </Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={portfolio.portfolioLink}
                  onChange={(e) =>
                    setPortfolio({ ...portfolio, portfolioLink: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Profile
                </Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={portfolio.githubLink}
                  onChange={(e) =>
                    setPortfolio({ ...portfolio, githubLink: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={portfolio.linkedinLink}
                  onChange={(e) =>
                    setPortfolio({ ...portfolio, linkedinLink: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Your Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Projects */}
              {portfolio.projects.length > 0 && (
                <div className="space-y-3 mb-4">
                  {portfolio.projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Project Form */}
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <Input
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Project Description (mention technologies used)"
                  rows={3}
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Skills used (comma-separated: Python, React, etc.)"
                  value={newProject.skills}
                  onChange={(e) =>
                    setNewProject({ ...newProject, skills: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addProject}
                  disabled={!newProject.title || !newProject.description}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={analyzePortfolio}
                  disabled={portfolio.projects.length === 0}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Portfolio & Detect Skills
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyzing State */}
      {analyzing && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Analyzing Your Portfolio...
              </h3>
              <p className="text-slate-600 mb-4">
                Our AI is scanning your bio, projects, and links to detect your
                skills
              </p>
              <Progress value={66} className="max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review Detected Skills */}
      {step === 3 && !analyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Detected Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    Analysis Complete!
                  </p>
                  <p className="text-sm text-green-800">
                    We've detected {portfolio.detectedSkills.length} skills from
                    your portfolio. Review them below and we'll match you with
                    relevant tasks.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Your Skills</h4>
              <div className="flex flex-wrap gap-2">
                {portfolio.detectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Tasks matching your skills will be prioritized in the
                    marketplace
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    You'll receive notifications for new relevant opportunities
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Companies can find you based on your skill profile
                  </span>
                </li>
              </ul>
            </div>

            <Button className="w-full" size="lg" onClick={completeSetup}>
              Complete Setup & Find Matching Tasks
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
