import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Github, Linkedin, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sidebarNavLinks } from "@/constants/navigation";
import "@/config/firebase";

interface DesktopSidebarProps {
  hasEnrolledBatches?: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ hasEnrolledBatches = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    const root = document.documentElement;
    if (newMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-background/95 backdrop-blur-xl border-r border-border/50 fixed left-0 top-0 z-40">
      {/* Sidebar Header */}
      <div className="p-6 pb-4 border-b border-border/30 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105">
          <img
            src="/logo.png"
            alt="Pie Wallah logo"
            className="h-12 w-12 rounded-xl border border-border/50 bg-background object-cover shadow-elevation-1 transition-all duration-300 group-hover:shadow-elevation-2 group-hover:scale-110"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground transition-colors duration-300">Pie Wallah</h2>
            <p className="text-sm text-muted-foreground transition-colors duration-300">Learn with the Best</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0">
        <nav className="space-y-1">
          {sidebarNavLinks.map((link, index) => (
            <div
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${
                isActive(link.path)
                  ? "bg-primary text-primary-foreground shadow-elevation-1"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <link.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="flex-1 transition-all duration-300">{link.label}</span>
              {isActive(link.path) && (
                <div className="h-2 w-2 rounded-full bg-current transition-all duration-300" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border/30 flex-shrink-0">
        {/* Dark Mode Toggle */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 hover-lift btn-smooth focus-ring"
            onClick={toggleDarkMode}
          >
            {isDark ? (
              <>
                <span className="h-4 w-4">☀️</span>
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <span className="h-4 w-4">🌙</span>
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Social Media Links */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Connect With Us</h3>
          <div className="flex items-center gap-2">
            {[
              { icon: Twitter, href: "https://twitter.com/satyamrojhax", label: "Twitter" },
              { icon: Instagram, href: "https://instagram.com/satyamrojha.dev", label: "Instagram" },
              { icon: Linkedin, href: "https://linkedin.com/in/satyamrojhax", label: "LinkedIn" },
              { icon: Github, href: "https://github.com/satyamrojhax", label: "GitHub" }
            ].map((social) => (
              <Button
                key={social.label}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 hover-lift btn-smooth focus-ring"
                onClick={() => window.open(social.href, "_blank")}
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
              </Button>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="text-center pt-2 border-t border-border/20">
          <p className="text-xs text-muted-foreground mb-1">Designed and Developed by</p>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-primary hover:text-primary/80 p-0 h-auto transition-all duration-300 hover:scale-105"
            onClick={() => window.open("https://instagram.com/satyamrojha.dev", "_blank")}
          >
            Satyam RojhaX
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
