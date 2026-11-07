import React, { useState, useEffect } from "react";
import { LoginComponent } from "../components";
import { BrandLogo } from "../components/BrandLogo";
import { SitePreloader } from "../components/SitePreloader";

const Login: React.FC = () => {
  const [storefrontUrl, setStorefrontUrl] = useState<string>("/");
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Read customizable storefront URL configured from admin dashboard
    const savedUrl = localStorage.getItem("accessglobal_storefront_url");
    if (savedUrl && savedUrl.trim()) {
      setStorefrontUrl(savedUrl.trim());
    } else if (window.location.port === "3001") {
      setStorefrontUrl("http://localhost:3000");
    } else {
      setStorefrontUrl("/");
    }

    // Smooth initial mount transition
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#121516] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-[#124330] selection:text-white">
      {/* Animated Brand Splash / Preloader */}
      <SitePreloader isLoaded={isReady} minDuration={500} subtitle="Central Command & Operations Portal" />

      {/* Editorial Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E5DAC9]">
        <div className="flex items-center gap-3">
          <BrandLogo size={32} subtitle="Admin Console" />
        </div>

        {/* Customizable Storefront Link */}
        <a
          href={storefrontUrl}
          className="text-xs font-semibold text-[#57625B] hover:text-[#124330] flex items-center gap-1.5 transition-colors group"
          title={`Visit Storefront: ${storefrontUrl}`}
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
          <span>Visit Storefront</span>
        </a>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center py-10 w-full">
        <LoginComponent />
      </main>

      {/* Editorial Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[#E5DAC9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#57625B] gap-2">
        <p>&copy; {new Date().getFullYear()} AccessGlobal. Direct Workshop Provenance &amp; Customs Protocol.</p>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>Security Protocol 2.4</span>
          <span className="text-[#E5DAC9]">&bull;</span>
          <span>End-to-End Encrypted Session</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
