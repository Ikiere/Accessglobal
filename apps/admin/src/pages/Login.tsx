import React from "react";
import { LoginComponent } from "../components";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] w-full flex justify-center items-center py-12 px-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-indigo-600/30 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-violet-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full">
        <LoginComponent />
      </div>
    </div>
  );
};

export default Login;
