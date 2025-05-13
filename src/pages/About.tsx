
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Connect Vols</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-6">
              Connect Vols is a platform dedicated to connecting passionate volunteers with meaningful opportunities to make a difference in their communities.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="mb-6">
              Our mission is to empower individuals to create positive change through volunteerism, while helping organizations find qualified volunteers to further their causes.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
            <p className="mb-6">
              Connect Vols streamlines the volunteer experience by:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
              <li>Connecting volunteers with projects that match their skills and interests</li>
              <li>Allowing organizations to post volunteer opportunities and manage applications</li>
              <li>Tracking volunteer hours and impact</li>
              <li>Building community through shared experiences and achievements</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
            <p className="mb-6">
              Connect Vols was founded in 2022 by a team of passionate individuals who saw a need for a more efficient way to connect volunteers with meaningful opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="text-center">
                <div className="h-32 w-32 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Alex Johnson" className="h-full w-full object-cover" />
                </div>
                <h3 className="font-semibold">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
              </div>
              <div className="text-center">
                <div className="h-32 w-32 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="https://i.pravatar.cc/150?img=12" alt="Maria Rodriguez" className="h-full w-full object-cover" />
                </div>
                <h3 className="font-semibold">Maria Rodriguez</h3>
                <p className="text-sm text-muted-foreground">Operations Director</p>
              </div>
              <div className="text-center">
                <div className="h-32 w-32 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="https://i.pravatar.cc/150?img=13" alt="David Kim" className="h-full w-full object-cover" />
                </div>
                <h3 className="font-semibold">David Kim</h3>
                <p className="text-sm text-muted-foreground">Community Manager</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
            <p className="mb-2">
              At Connect Vols, we believe in:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
              <li><strong>Community Impact</strong> - Making a measurable difference in communities</li>
              <li><strong>Inclusivity</strong> - Creating opportunities for people of all backgrounds</li>
              <li><strong>Transparency</strong> - Being open about our operations and impact</li>
              <li><strong>Innovation</strong> - Continually improving how we connect volunteers with opportunities</li>
              <li><strong>Empowerment</strong> - Giving individuals the tools to create change</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Get Involved</h2>
            <p className="mb-6">
              Whether you're looking to volunteer, post opportunities, or partner with us, we'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/signup">
                <Button>Sign Up as a Volunteer</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
