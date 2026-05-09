import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Expert {
  _id: string;
  name: string;
  expertise: string;
  bio: string;
  availableSlots: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const neoToast = {
  error: (msg: string) => toast.error(msg, {
    style: {
      border: '4px solid black',
      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
      borderRadius: '0',
      background: '#f87171',
      color: 'black',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '-0.05em'
    }
  })
};

const ExpertList = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get<Expert[]>(`${API_URL}/api/experts`);
        setExperts(response.data);
      } catch (err: any) {
        neoToast.error('FAILED TO FETCH EXPERTS');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-64 animate-pulse">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 bg-gray-300 border-4 border-black shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 w-3/4 border-2 border-black"></div>
                <div className="h-4 bg-gray-300 w-1/2 border-2 border-black"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 w-full border-2 border-black"></div>
              <div className="h-4 bg-gray-300 w-5/6 border-2 border-black"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] text-[#FF5F1F]">
            OUR EXPERTS
          </h1>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-tight mt-2 text-black">
            BOOK A SESSION WITH INDUSTRY LEADERS
          </p>
        </div>
        <div className="bg-[#FFD300] border-4 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg h-max">
          {experts.length} EXPERTS FOUND
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experts.map((expert, i) => {
          // Cycle through some background colors for the brutalist cards
          const bgColors = ['bg-[#FFD300]', 'bg-[#4ade80]', 'bg-[#60a5fa]', 'bg-[#f472b6]', 'bg-[#FF5F1F]'];
          const avatarBg = bgColors[i % bgColors.length];
          const hasSlots = expert.availableSlots.length > 0;

          return (
            <motion.div
              key={expert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group h-full"
            >
              <Link to={`/experts/${expert._id}`} className="block h-full outline-none">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col relative overflow-hidden group-focus-visible:ring-4 group-focus-visible:ring-[#FF5F1F]">
                  <div className="p-6 flex flex-col flex-1 relative z-10 bg-white">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 ${avatarBg} border-4 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                        <User size={32} strokeWidth={3} className="text-black" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mb-2 group-hover:underline decoration-4 underline-offset-4">
                          {expert.name}
                        </h2>
                        <span className="inline-block px-2 py-1 bg-black text-white text-xs font-black uppercase tracking-tighter">
                          {expert.expertise}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 font-bold uppercase text-sm leading-snug line-clamp-3 mb-6 border-l-4 border-black pl-3 bg-gray-50 py-2">
                      {expert.bio}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t-4 border-black pt-4">
                      <div className={`px-3 py-1 border-4 border-black font-black text-sm uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                        ${hasSlots ? 'bg-[#4ade80] text-black' : 'bg-gray-300 text-gray-600'}`}>
                        {hasSlots ? `${expert.availableSlots.length} SLOTS OPEN` : 'FULLY BOOKED'}
                      </div>
                      <div className="w-10 h-10 bg-[#FF5F1F] border-4 border-black flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                        <ArrowRight strokeWidth={4} size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                  {/* Decorative diagonal lines pattern on hover background */}
                  <div className="absolute inset-0 bg-[#FFD300] opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none -z-0" 
                       style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,1) 10px, rgba(0,0,0,1) 20px)' }}>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertList;
