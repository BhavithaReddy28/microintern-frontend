import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  CheckCircle,
  Plus,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface SkillSelectorProps {
  onComplete: (skills: string[]) => void;
}

const POPULAR_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Java",
  "C++",
  "HTML/CSS",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Git",
  "Machine Learning",
  "Data Analysis",
  "Data Visualization",
  "Excel",
  "UI/UX Design",
  "Figma",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Video Editing",
  "Content Writing",
  "Copywriting",
  "SEO",
  "Social Media Marketing",
  "Digital Marketing",
  "Email Marketing",
  "Graphic Design",
  "Photography",
  "Project Management",
  "Business Analysis",
  "Market Research",
  "Financial Analysis",
  "Accounting",
  "Customer Service",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Teamwork",
];

const SKILL_CATEGORIES = {
  "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "HTML/CSS", "React", "Node.js"],
  "Data & Analytics": ["Data Analysis", "SQL", "Excel", "Data Visualization", "Machine Learning", "MongoDB"],
  "Design": ["UI/UX Design", "Figma", "Adobe Photoshop", "Adobe Illustrator", "Graphic Design"],
  "Marketing": ["Digital Marketing", "Social Media Marketing", "SEO", "Content Writing", "Copywriting", "Email Marketing"],
  "Business": ["Project Management", "Business Analysis", "Market Research", "Financial Analysis", "Accounting"],
  "Soft Skills": ["Communication", "Leadership", "Problem Solving", "Teamwork", "Customer Service"],
};

export function SkillSelector({ onComplete }: SkillSelectorProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkill("");
      toast.success(`Added "${trimmed}" to your skills`);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleComplete = () => {
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    onComplete(selectedSkills);
    toast.success(`${selectedSkills.length} skills saved! Finding matching tasks...`);
  };

  const filteredSkills = activeCategory === "All" 
    ? POPULAR_SKILLS 
    : SKILL_CATEGORIES[activeCategory as keyof typeof SKILL_CATEGORIES] || [];

  const displaySkills = searchQuery
    ? filteredSkills.filter((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredSkills;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Select Your Skills
          </CardTitle>
          <p className="text-sm text-slate-600">
            Choose the skills you have so we can recommend the most relevant tasks
            for you. Select at least 3 skills.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Skills Display */}
          {selectedSkills.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold text-blue-900">
                  Your Skills ({selectedSkills.length})
                </Label>
                <Badge className="bg-blue-600 text-white">
                  {selectedSkills.length >= 3 ? "✓ Ready" : `${3 - selectedSkills.length} more needed`}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-blue-600 text-white hover:bg-blue-700 pr-1"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <Label htmlFor="search">Search Skills</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Search for skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <Label className="mb-2 block">Browse by Category</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("All")}
              >
                All Skills
              </Button>
              {Object.keys(SKILL_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Skill Selection Grid */}
          <div>
            <Label className="mb-2 block">
              {activeCategory === "All" ? "Popular Skills" : activeCategory}
            </Label>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {displaySkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-lg border-2 text-sm text-left transition-all ${
                      selectedSkills.includes(skill)
                        ? "border-blue-600 bg-blue-50 text-blue-900 font-semibold"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{skill}</span>
                      {selectedSkills.includes(skill) && (
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {displaySkills.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No skills found. Try a different search or add a custom skill.
                </p>
              )}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="pt-4 border-t">
            <Label htmlFor="customSkill">Add Custom Skill</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="customSkill"
                placeholder="Enter a skill not listed above..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <Button
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            disabled={selectedSkills.length < 3}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Continue with {selectedSkills.length} Skills
          </Button>
          {selectedSkills.length < 3 && (
            <p className="text-xs text-center text-slate-500">
              Select at least 3 skills to continue
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Why do we ask for your skills?
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Get personalized task recommendations matching your expertise</li>
                <li>• Companies can find you based on specific skills</li>
                <li>• Higher chances of getting accepted for relevant tasks</li>
                <li>• You can update your skills anytime from your profile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
