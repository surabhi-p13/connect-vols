
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Badge, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { useNotificationStore } from "@/store/notificationStore";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { applyToProject } = useProjectStore();
  const { addNotification } = useNotificationStore();

  const handleApply = () => {
    if (!isAuthenticated) {
      return;
    }

    setIsApplying(true);

    // Simulate API call
    setTimeout(() => {
      applyToProject(project.id);
      addNotification({
        id: `apply-${Date.now()}`,
        userId: "1", // Using mock user ID
        message: `You have applied to "${project.title}"`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
        link: `/projects/${project.id}`,
      });
      setIsApplying(false);
    }, 500);
  };

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const startDate = formatDate(project.startDate);
  const spots = project.volunteersNeeded - project.volunteersApplied;

  return (
    <Card className="overflow-hidden card-hover h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-secondary-foreground">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm py-1 px-2 rounded text-xs font-medium">
          {project.category}
        </div>
      </div>

      <CardContent className="pt-4 flex-1">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-bold line-clamp-1 mb-2">{project.title}</h3>

          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{project.location}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{startDate}</span>
          </div>

          <p className="text-sm line-clamp-2 mb-4">{project.description}</p>

          <div className="mt-auto">
            <div className="flex flex-wrap gap-1 mb-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-secondary text-secondary-foreground text-xs py-1 px-2 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border pt-4 flex items-center justify-between">
        <div className="flex items-center text-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center mr-3">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{spots} spots left</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{spots} out of {project.volunteersNeeded} spots available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>3 hours</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated volunteer duration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isAuthenticated ? (
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isApplying || spots <= 0}
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        ) : (
          <Link to="/login">
            <Button size="sm" variant="outline">
              Login to Apply
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
