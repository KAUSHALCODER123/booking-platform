import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ExpertList from './components/ExpertList';
import ExpertDetail from './components/ExpertDetail';
import MyBookings from './components/MyBookings';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-gray-50 font-sans text-black selection:bg-[#FFD300] selection:text-black">
          <header className="bg-white border-b-4 border-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <Link to="/" className="text-3xl sm:text-4xl font-black uppercase tracking-tighter hover:-translate-y-1 hover:text-[#FF5F1F] transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Expert Directory
              </Link>
              <nav>
                <Link to="/bookings" className="text-lg sm:text-xl font-black uppercase tracking-tighter border-4 border-black px-4 py-2 bg-[#FFD300] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all inline-block">
                  MY BOOKINGS
                </Link>
              </nav>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<ExpertList />} />
              <Route path="/experts/:id" element={<ExpertDetail />} />
              <Route path="/bookings" element={<MyBookings />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
