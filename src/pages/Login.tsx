
import { Layout } from "@/components/layout/Layout";
import { AuthForm } from "@/components/auth/AuthForm";

const Login = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Log in to your account to manage volunteer opportunities
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </Layout>
  );
};

export default Login;
