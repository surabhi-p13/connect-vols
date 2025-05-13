
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Share2,
  Heart,
  CheckCircle,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, applyToProject } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Find the project with the given ID
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/projects">
            <Button>Browse Projects</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const startDate = formatDate(project.startDate);
  const endDate = formatDate(project.endDate);
  const spots = project.volunteersNeeded - project.volunteersApplied;

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

      toast({
        title: "Application Submitted",
        description: "You have successfully applied to this project.",
      });

      setIsApplying(false);
      setHasApplied(true);
    }, 1000);
  };

  const handleShare = () => {
    // Simulate sharing functionality
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Project link has been copied to clipboard.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant={project.status === "open" ? "default" : "secondary"}>
                    {project.status === "open" ? "Accepting Volunteers" : "Closed"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project.location}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Project Image */}
          <div className="mb-8 rounded-lg overflow-hidden h-80">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold mb-4">About This Project</h2>
                <p className="text-foreground mb-6">{project.description}</p>

                <h3 className="text-xl font-semibold mb-3">Skills Needed</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="responsibilities">
                    <AccordionTrigger className="text-xl font-semibold">
                      Volunteer Responsibilities
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Arrive on time and check in with the project coordinator</li>
                        <li>Follow all safety guidelines and instructions</li>
                        <li>Complete assigned tasks to the best of your ability</li>
                        <li>Collaborate with other volunteers and staff</li>
                        <li>Report any issues or concerns to the project coordinator</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="requirements">
                    <AccordionTrigger className="text-xl font-semibold">
                      Requirements
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Must be 18 years or older</li>
                        <li>Comfortable working in an outdoor environment</li>
                        <li>Ability to perform physical tasks for extended periods</li>
                        <li>No prior experience necessary - training will be provided</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="organization">
                    <AccordionTrigger className="text-xl font-semibold">
                      About the Organization
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground mb-4">
                        {project.organization} is dedicated to making a positive impact in the community through various initiatives focused on {project.category.toLowerCase()} issues.
                      </p>
                      <p className="text-muted-foreground">
                        Founded in 2010, the organization has successfully implemented over 200 projects with the help of dedicated volunteers.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">{startDate}</p>
                        <p className="text-sm text-muted-foreground">9:00 AM - 3:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                        <a
                          href={`https://maps.google.com/?q=${project.location}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View on map
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Spots Available</p>
                        <p className="text-sm text-muted-foreground">
                          {spots} of {project.volunteersNeeded} spots left
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">Approximately 6 hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    {hasApplied ? (
                      <div className="bg-primary/10 rounded-lg p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          You'll be notified when your application is reviewed.
                        </p>
                      </div>
                    ) : (
                      <>
                        {isAuthenticated ? (
                          <Button
                            className="w-full"
                            disabled={isApplying || spots <= 0 || project.status !== "open"}
                            onClick={handleApply}
                          >
                            {isApplying
                              ? "Applying..."
                              : spots <= 0 || project.status !== "open"
                              ? "No Spots Available"
                              : "Apply Now"}
                          </Button>
                        ) : (
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground mb-2">
                              Sign in to apply for this project
                            </p>
                            <Link to="/login">
                              <Button variant="outline" className="w-full">
                                Log In
                              </Button>
                            </Link>
                            <Link to="/signup">
                              <Button className="w-full">Sign Up</Button>
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have questions about this project? Contact the project coordinator:
                  </p>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Project Coordinator</p>
                  <a
                    href="mailto:sarah@example.com"
                    className="text-sm text-primary hover:underline"
                  >
                    sarah@{project.organization.toLowerCase().replace(/\s+/g, '')}.org
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
