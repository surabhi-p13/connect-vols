
import { Layout } from "@/components/layout/Layout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { useProjectStore } from "@/store/projectStore";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, Loader2 } from "lucide-react";
import { useState } from "react";

const Projects = () => {
  const { filteredProjects, isLoading } = useProjectStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Volunteer Projects</h1>
          <p className="text-muted-foreground">
            Find and apply for volunteer opportunities that match your skills and interests.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground mr-2">View:</span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ProjectFilters />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search criteria.
            </p>
            <Button onClick={() => useProjectStore.getState().resetFilters()}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Projects</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
