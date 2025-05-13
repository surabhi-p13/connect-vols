
import { Link } from "react-router-dom";
import { ArrowRight, Search, Users, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjectStore } from "@/store/projectStore";

const Index = () => {
  const { projects } = useProjectStore();
  const featuredProjects = projects.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/90 to-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-in">
              Connect with Meaningful Volunteer Opportunities
            </h1>
            <p className="text-lg mb-8 text-white/90">
              Join our community and make a real impact by volunteering for projects that match your skills and interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/projects">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Find Projects
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
            <Link to="/projects" className="text-primary flex items-center hover:underline">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How Connect Vols Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to find volunteer opportunities that match your skills and interests.
              Get started in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Projects</h3>
              <p className="text-muted-foreground">
                Explore volunteer opportunities that match your skills, interests, and availability.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Apply</h3>
              <p className="text-muted-foreground">
                Apply to projects with one click and connect with project coordinators for more information.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make an Impact</h3>
              <p className="text-muted-foreground">
                Volunteer for projects, track your hours, and see the positive change you're making in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Collective Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Together with our volunteers and community partners, we're making a real difference every day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <p className="text-muted-foreground">Active Volunteers</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <p className="text-muted-foreground">Community Partners</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">45,000+</div>
              <p className="text-muted-foreground">Volunteer Hours</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">750+</div>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Volunteer Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from volunteers who have made an impact through Connect Vols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://i.pravatar.cc/150?img=2"
                  alt="Sarah J."
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Sarah J.</h4>
                  <p className="text-sm text-muted-foreground">Environmental Volunteer</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Connect Vols made it easy for me to find beach cleanup projects in my area. 
                I've met amazing people and feel like I'm making a real difference."
              </p>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://i.pravatar.cc/150?img=3"
                  alt="Michael T."
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Michael T.</h4>
                  <p className="text-sm text-muted-foreground">Education Volunteer</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "As a retired teacher, I wanted to continue making an impact. Through Connect Vols, 
                I found an after-school tutoring program that perfectly matches my experience."
              </p>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://i.pravatar.cc/150?img=4"
                  alt="Aisha M."
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Aisha M.</h4>
                  <p className="text-sm text-muted-foreground">Food Bank Volunteer</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The platform made it so easy to find food bank opportunities near me. 
                I love the tracking features that show my total volunteer hours and impact."
              </p>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${i === 4 ? "text-amber-300" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-8 lg:mb-0 lg:mr-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-white/90 max-w-xl">
                Join our community of volunteers and start connecting with meaningful projects today. Together, we can create positive change.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
