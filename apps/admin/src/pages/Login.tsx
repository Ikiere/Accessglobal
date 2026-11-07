import React from "react";
import { LoginComponent } from "../components";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#121516] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-[#124330] selection:text-white">
      {/* Subtle Editorial Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E5DAC9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#124330] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AG
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-[#124330]">
            AccessGlobal
          </span>
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#57625B] font-mono border-l border-[#E5DAC9] pl-3">
            Admin Console
          </span>
        </div>

        <a
          href="/"
          className="text-xs font-semibold text-[#57625B] hover:text-[#124330] flex items-center gap-1.5 transition-colors"
        >
          <span>&larr; Return to Storefront</span>
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
          <span>Direct Supabase BaaS</span>
          <span className="text-[#E5DAC9]">&bull;</span>
          <span>End-to-End Encrypted</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
