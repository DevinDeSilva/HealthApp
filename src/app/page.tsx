import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Activity, Heart, Shield, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Our Family <span className="text-blue-600">Health Tracker</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A private space for us to log, visualize, and track our vital health metrics. 
              Keep an eye on blood pressure, sugar levels, and weight with secure, shared insights for the family.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Join the Family
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Detailed Tracking</h3>
              <p className="text-gray-600">Easily log blood pressure, sugar readings, and weight with just a few clicks.</p>
            </div>
            <div className="p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Visual Trends</h3>
              <p className="text-gray-600">Understand your health trends over time with beautiful, interactive charts.</p>
            </div>
            <div className="p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your health data is encrypted and stored securely. Only you have access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2026 HealthTrack Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
