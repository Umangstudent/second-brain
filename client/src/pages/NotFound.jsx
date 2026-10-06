import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden p-4">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-panel p-12 rounded-3xl text-center max-w-lg w-full relative z-10 border border-white/10 shadow-2xl flex flex-col items-center animate-slide-up">
        <div className="relative mb-6">
           <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white/20 to-white/5 select-none drop-shadow-sm">404</h1>
           <div className="absolute inset-0 flex items-center justify-center text-4xl" role="img" aria-label="confused brain">
             🧠❓
           </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Page not found</h2>
        <p className="text-white/60 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Looks like this thought got lost in your Second Brain. We couldn't find the page you're looking for.
        </p>
        
        <Link to="/" className="btn-primary flex items-center gap-2 group px-6 py-3">
          <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
