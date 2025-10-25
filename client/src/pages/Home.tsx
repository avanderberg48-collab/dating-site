import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/discover");
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-red-600">{APP_TITLE}</h1>
          </div>
          <a href={getLoginUrl()} className="text-red-600 hover:text-red-700 font-medium">
            Sign In
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Match
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with like-minded adults. Browse profiles, chat, and explore meaningful connections.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Get Started
              </Button>
            </a>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">100K+</div>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">50K+</div>
              <p className="text-gray-600">Matches Made</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
              <p className="text-gray-600">Chat Support</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
