import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    bio: "",
    age: "",
    gender: "male",
    lookingFor: "female",
    location: "",
    photoUrl: "",
    interests: "",
  });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      navigate("/discover");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      bio: formData.bio,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender as "male" | "female" | "other",
      lookingFor: formData.lookingFor as "male" | "female" | "both",
      location: formData.location,
      photoUrl: formData.photoUrl,
      interests: formData.interests,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-8">Help us find your perfect match</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="lookingFor">Looking For</Label>
            <select
              id="lookingFor"
              value={formData.lookingFor}
              onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              placeholder="e.g., Travel, Fitness, Music (comma-separated)"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Continue to Discover"}
          </Button>
        </form>
      </div>
    </div>
  );
}
