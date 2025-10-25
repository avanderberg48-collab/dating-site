import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Heart, X } from "lucide-react";

export default function Discover() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [lookingFor, setLookingFor] = useState("female");

  const { data: profiles = [], isLoading } = trpc.discover.browse.useQuery({
    lookingFor: lookingFor as "male" | "female" | "both",
    limit: 20,
  });

  const likeProfile = trpc.discover.like.useMutation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!user) {
    navigate("/");
    return null;
  }

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    if (currentProfile) {
      likeProfile.mutate({ targetUserId: currentProfile.userId });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">DatingConnect</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/messages")}>
              Messages
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Looking for:
          </label>
          <select
            value={lookingFor}
            onChange={(e) => {
              setLookingFor(e.target.value);
              setCurrentIndex(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="female">Women</option>
            <option value="male">Men</option>
            <option value="both">Both</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading profiles...</p>
          </div>
        ) : currentIndex >= profiles.length ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No more profiles to show</p>
            <Button onClick={() => setCurrentIndex(0)}>Start Over</Button>
          </div>
        ) : currentProfile ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {currentProfile.photoUrl && (
                <img
                  src={currentProfile.photoUrl}
                  alt={currentProfile.userId.toString()}
                  className="w-full h-96 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentProfile.age ? `${currentProfile.age}` : "Age not set"}
                </h2>
                {currentProfile.location && (
                  <p className="text-gray-600 mb-4">{currentProfile.location}</p>
                )}
                {currentProfile.bio && (
                  <p className="text-gray-700 mb-4">{currentProfile.bio}</p>
                )}
                {currentProfile.interests && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.interests.split(",").map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handlePass}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Pass
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleLike}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
