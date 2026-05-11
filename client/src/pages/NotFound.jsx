import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, LifeBuoy, ShieldAlert } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
      <div className="max-w-lg w-full text-center">
        
        {/* Animated Error Illustration */}
        <div className="relative mb-12">
          <div className="text-[12rem] font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl shadow-blue-100 flex items-center justify-center rotate-12 border border-slate-50">
              <ShieldAlert className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 md:p-14">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
            Lost in the Cloud?
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
            The path you’re looking for isn't authorized or has been relocated within the <span className="text-blue-600 font-bold">Zambia Z</span> network.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/dashboard"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
            >
              <Home className="h-4 w-4" />
              Return to Hub
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-white hover:border-blue-300 transition-all"
              >
                <ArrowLeft className="h-3 w-3" />
                Previous
              </button>

              <Link
                to="/support"
                className="flex items-center justify-center gap-2 py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-white hover:border-blue-300 transition-all"
              >
                <LifeBuoy className="h-3 w-3" />
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-12">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-slate-200 rounded-lg mb-4">
            <span className="text-slate-500 text-sm font-black italic">Z</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Zambia Z Digital Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
