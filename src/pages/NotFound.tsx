import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="app-card w-full max-w-md p-8 text-center">
        <h1 className="mb-4 text-4xl font-semibold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Page not found</p>
        <a href="/" className="text-primary underline underline-offset-4 hover:text-[#0e8d6e]">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
