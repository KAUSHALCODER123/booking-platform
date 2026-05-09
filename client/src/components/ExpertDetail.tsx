import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface Expert {
  _id: string;
  name: string;
  expertise: string;
  bio: string;
  availableSlots: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const neoToast = {
  success: (msg: string) => toast.success(msg, {
    style: {
      border: '4px solid black',
      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
      borderRadius: '0',
      background: '#4ade80',
      color: 'black',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '-0.05em'
    }
  }),
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

const ExpertDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<{date: string, slot: string}[]>([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);

    const fetchExpert = async () => {
      try {
        const response = await axios.get<Expert>(`${API_URL}/api/experts/${id}`);
        setExpert(response.data);
      } catch (err: any) {
        neoToast.error('FAILED TO FETCH EXPERT DETAILS');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpert();
      
      const socket = io(API_URL);
      
      socket.emit('join-room', id);
      
      socket.on('slot-booked', (data: { date: string, slot: string }) => {
        setBookedSlots(prev => [...prev, data]);
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [id]);

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!slot) {
      neoToast.error('PLEASE SELECT A TIME SLOT');
      return;
    }
    setBookingLoading(true);

    try {
      await axios.post(`${API_URL}/api/bookings`, {
        expertId: id,
        userEmail: email,
        date,
        slot
      });
      neoToast.success('BOOKING CONFIRMED');
      setEmail('');
      setSlot('');
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        neoToast.error('SLOT ALREADY TAKEN');
        setBookedSlots(prev => [...prev, { date, slot }]);
        setSlot('');
      } else {
        neoToast.error('FAILED TO BOOK SLOT');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white animate-pulse">
        <div className="h-10 bg-gray-300 w-1/3 mb-8 border-4 border-black"></div>
        <div className="h-64 bg-gray-300 border-4 border-black mb-8"></div>
        <div className="h-32 bg-gray-300 border-4 border-black"></div>
      </div>
    );
  }

  if (!expert) return <div className="text-center py-20 font-black text-5xl uppercase tracking-tighter">EXPERT NOT FOUND</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 p-4">
      <Link to="/" className="inline-block px-6 py-2 border-4 border-black bg-white font-black uppercase tracking-tighter hover:bg-[#FFD300] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none">
        &larr; BACK
      </Link>

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-black bg-[#FFD300] flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <User size={80} strokeWidth={3} className="text-black" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-4">
            {expert.name}
          </h1>
          <div className="inline-block px-4 py-2 border-4 border-black bg-[#FF5F1F] text-white font-black uppercase tracking-tighter w-max mb-6 text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {expert.expertise}
          </div>
          <p className="text-xl font-bold border-l-4 border-black pl-4 py-2 bg-gray-50 uppercase tracking-tight">
            {expert.bio}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Slots Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Date Picker */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">SELECT DATE</h2>
            <input 
              type="date" 
              value={date}
              onChange={(e) => { setDate(e.target.value); setSlot(''); }}
              className="w-full p-4 border-4 border-black bg-[#FFD300] font-black text-2xl uppercase tracking-tighter focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer"
            />
          </div>

          {/* Time Slots */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">SELECT TIME</h2>
            
            {expert.availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {expert.availableSlots.map(s => {
                  const isBooked = bookedSlots.some(b => b.date === date && b.slot === s);
                  const isSelected = slot === s;
                  
                  if (isBooked) {
                    return (
                      <div 
                        key={s}
                        className="relative overflow-hidden border-4 border-gray-400 bg-gray-200 text-gray-500 font-black text-xl uppercase tracking-tighter py-4 text-center pointer-events-none opacity-80"
                      >
                        {/* Brutalist Strikethrough effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[150%] h-2 bg-gray-500 rotate-12 absolute border-y-2 border-gray-600"></div>
                          <div className="w-[150%] h-2 bg-gray-500 -rotate-12 absolute border-y-2 border-gray-600"></div>
                        </div>
                        <span className="relative z-10 bg-gray-200 px-2">{s}</span>
                      </div>
                    );
                  }

                  return (
                    <motion.button
                      key={s}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSlot(s)}
                      className={`border-4 border-black font-black text-xl uppercase tracking-tighter py-4 text-center transition-all
                        ${isSelected
                          ? 'bg-[#FF5F1F] text-white shadow-none translate-y-1'
                          : 'bg-white hover:bg-[#FFD300] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                        }
                      `}
                    >
                      {s}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <p className="font-black text-xl uppercase tracking-tighter p-6 bg-gray-100 border-4 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                NO SLOTS AVAILABLE
              </p>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-[#FFD300] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-max lg:sticky lg:top-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">BOOK NOW</h2>
          <form onSubmit={handleBooking} className="flex flex-col gap-6">
            
            <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="font-black uppercase tracking-tighter text-sm mb-1 text-gray-500">SELECTED SLOT</div>
              <div className="font-black text-2xl uppercase tracking-tighter">
                {date ? (() => {
                  const [y, m, d] = date.split('-');
                  return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                })() : 'NONE'} 
                {slot ? ` @ ${slot}` : ''}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-black uppercase tracking-tighter mb-2 text-xl">YOUR EMAIL</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-4 border-black bg-white font-bold text-xl placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                placeholder="EMAIL@EXAMPLE.COM"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={bookingLoading || !slot}
              className={`mt-4 w-full py-6 px-4 border-4 border-black font-black text-3xl uppercase tracking-tighter transition-all flex items-center justify-center
                ${bookingLoading || !slot
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-80 border-gray-400 shadow-none'
                  : 'bg-[#FF5F1F] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none'
                }
              `}
            >
              {bookingLoading ? 'PROCESSING...' : 'CONFIRM BOOKING'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpertDetail;
