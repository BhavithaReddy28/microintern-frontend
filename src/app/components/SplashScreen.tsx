import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { cn } from "./ui/utils";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Animation sequence
    const logoTimer = setTimeout(() => setShowLogo(true), 500);
    const textTimer = setTimeout(() => setShowText(true), 1500);
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800); // Wait for exit animation
    }, 3500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 transition-all duration-1000 ease-in-out",
        !isVisible && "opacity-0 scale-110 pointer-events-none"
      )}
    >
      <div className="relative flex flex-col items-center z-10">
        {/* Logo Icon */}
        <div
          className={cn(
            "relative bg-blue-600 p-8 rounded-[40px] shadow-[0_0_80px_rgba(37,99,235,0.3)] transition-all duration-1000 scale-0 rotate-[10deg] opacity-0 flex items-center justify-center",
            showLogo && "scale-100 rotate-0 opacity-100"
          )}
        >
          <Briefcase className="w-20 h-20 text-white" />
        </div>

        {/* Brand Text */}
        <div className="mt-10 text-center">
          <div className="overflow-hidden">
            <h1
              className={cn(
                "text-3xl md:text-5xl font-black text-white tracking-tighter transition-all duration-1000 translate-y-full pb-2",
                showText && "translate-y-0"
              )}
            >
              Fair Micro Intern Marketplace
            </h1>
          </div>
          <div className="overflow-hidden">
            <p
              className={cn(
                "text-lg md:text-2xl text-blue-400 italic font-medium transition-all duration-1000 translate-y-full delay-300",
                showText && "translate-y-0"
              )}
            >
              Where opportunities meet fairness
            </p>
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className="mt-12 w-64 h-0.5 bg-slate-800 rounded-full overflow-hidden opacity-50">
          <div 
            className={cn(
              "h-full bg-blue-500 transition-all duration-[3000ms] ease-out w-0",
              showLogo && "w-full"
            )}
          />
        </div>
      </div>
      
      {/* Massive Soft Glow */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full transition-all duration-[2000ms] scale-0",
          showLogo && "scale-100"
        )}
      />
    </div>
  );
}
