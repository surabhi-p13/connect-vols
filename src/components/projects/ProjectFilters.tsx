
import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store/projectStore";

const CATEGORIES = [
  "All",
  "Education",
  "Environment",
  "Health",
  "Food Security",
  "Community",
  "Arts",
  "Social Justice",
];

const SKILLS = [
  "Teaching",
  "Gardening",
  "Physical Labor",
  "Organization",
  "Customer Service",
  "Cooking",
  "Communication",
  "Empathy",
  "Environmental Awareness",
  "Patience",
];

export function ProjectFilters() {
  const { filters, setFilters, resetFilters } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ location: searchTerm });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ category: category === "All" ? "" : category });
  };

  const toggleSkill = (skill: string) => {
    const updatedSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    setFilters({ skills: updatedSkills });
  };

  const handleReset = () => {
    resetFilters();
    setSearchTerm("");
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
        <Button
          type="button"
          variant="outline"
          className="md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </form>

      {/* Filter Section */}
      <div className={`${showFilters ? "block" : "hidden"} md:block`}>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="w-full md:w-auto">
            <Select
              value={filters.category || "All"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ status: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="ml-auto text-muted-foreground"
            size="sm"
          >
            <X className="h-4 w-4 mr-1" /> Reset Filters
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => {
              const isSelected = filters.skills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer ${
                    isSelected ? "" : "hover:bg-secondary"
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
