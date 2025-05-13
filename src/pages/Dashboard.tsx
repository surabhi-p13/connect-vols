
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Award,
  Heart,
  ChevronRight,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BadgeCard } from "@/components/dashboard/BadgeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { User, Project } from "@/types";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <p className="mb-8 text-muted-foreground">
            You need to be logged in to view your dashboard.
          </p>
          <Link to="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Mock data for the dashboard
  const upcomingProjects: Project[] = projects.slice(0, 2);
  const pastProjects: Project[] = projects.slice(2, 4);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Here's an overview of your volunteer activities.
            </p>
          </div>
          <Link to="/projects">
            <Button className="mt-4 md:mt-0">Find New Projects</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Hours Volunteered"
            value={user.hoursContributed || 0}
            icon={<Clock className="h-6 w-6" />}
            trend="up"
            trendValue="+3 hrs this week"
          />
          <StatsCard
            title="Projects Completed"
            value={user.projectsCompleted || 0}
            icon={<BadgeCheck className="h-6 w-6" />}
            trend="up"
            trendValue="+1 this month"
          />
          <StatsCard
            title="Achievements"
            value={user.badges?.length || 0}
            icon={<Award className="h-6 w-6" />}
          />
          <StatsCard
            title="Impact Made"
            value="High"
            description="Top 10% of volunteers"
            icon={<Heart className="h-6 w-6" />}
          />
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Projects</TabsTrigger>
            <TabsTrigger value="past">Past Projects</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Projects */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Upcoming Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You don't have any upcoming volunteer projects.
                      </p>
                      <Link to="/projects">
                        <Button>Find Projects</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start">
                            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mr-4">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{project.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{project.location}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(project.startDate)}
                              </div>
                            </div>
                          </div>
                          <Link to={`/projects/${project.id}`}>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  {!user.badges || user.badges.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Complete volunteer projects to earn badges.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {user.badges.slice(0, 4).map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Your Upcoming Volunteer Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You don't have any upcoming volunteer projects.
                    </p>
                    <Link to="/projects">
                      <Button>Find Projects</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col md:flex-row md:items-center justify-between border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mr-4">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{project.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{project.location}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(project.startDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button size="sm">Check In</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Your Past Volunteer Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {pastProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You haven't completed any volunteer projects yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col md:flex-row md:items-center justify-between border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mr-4">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{project.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{project.location}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(project.startDate)} • 3 hours
                            </div>
                          </div>
                        </div>
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle>Your Badges & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.badges || user.badges.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Complete volunteer projects to earn badges.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {user.badges.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
