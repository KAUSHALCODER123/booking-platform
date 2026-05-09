import { useState, FormEvent } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Booking {
  _id: string;
  expertId: {
    _id: string;
    name: string;
    expertise: string;
  };
  userEmail: string;
  date: string;
  slot: string;
  status: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyBookings = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await axios.get<Booking[]>(`${API_URL}/api/bookings?email=${encodeURIComponent(email)}`);
      setBookings(response.data);
    } catch (err: any) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await axios.patch<Booking>(`${API_URL}/api/bookings/${id}/status`, {
        status: newStatus
      });
      
      setBookings(prev => 
        prev.map(booking => 
          booking._id === id ? { ...booking, status: response.data.status } : booking
        )
      );
      toast.success('Status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      
      <form onSubmit={handleSearch} className="mb-8 flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email to view bookings"
          required
          className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {loading && hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && !loading && (
        bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.expertId?.name || 'Unknown Expert'}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status || 'pending'}
                  </span>
                </div>
                <p className="text-blue-600 mb-4">{booking.expertId?.expertise || ''}</p>
                <div className="text-gray-700 mb-4">
                  <p><span className="font-medium">Date:</span> {booking.date}</p>
                  <p><span className="font-medium">Slot:</span> {booking.slot}</p>
                </div>
                
                {booking.status !== 'completed' && (
                  <button
                    onClick={() => updateStatus(booking._id, 'completed')}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No bookings found for this email.</p>
        )
      )}
    </div>
  );
};

export default MyBookings;
