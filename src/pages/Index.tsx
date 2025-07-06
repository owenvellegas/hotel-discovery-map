import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import seattleHotelData from '@/data/seattle_hotel_data.json';

// Define the Hotel interface based on the JSON structure
interface Hotel {
  hotel_id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  star_rating: number;
  rating: number;
  review_count: number;
  image_url: string;
  amenities: string[];
  room_type: string;
  currency: string;
}

// Convert JSON data to match our interface
const seattleHotels: Hotel[] = seattleHotelData.map((hotel: any) => ({
  ...hotel,
  // Convert price_per_night to number if it's a string
  price_per_night: typeof hotel.price_per_night === 'string' ? parseInt(hotel.price_per_night) : hotel.price_per_night
}));
import MapboxMap from '@/components/MapboxMap';
import HotelCard from '@/components/HotelCard';
import { Search, Filter, MapPin, Star, Hotel as HotelIcon, Sparkles } from 'lucide-react';

const Index = () => {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');
  const hotelListRef = useRef<HTMLDivElement>(null);

  const filteredHotels = seattleHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'budget' && hotel.price_per_night < 1000) ||
                        (priceFilter === 'mid' && hotel.price_per_night >= 1000 && hotel.price_per_night < 1500) ||
                        (priceFilter === 'luxury' && hotel.price_per_night >= 1500);
    
    return matchesSearch && matchesPrice;
  });

  // Scroll to selected hotel when it changes
  useEffect(() => {
    if (selectedHotel && hotelListRef.current) {
      const hotelElement = hotelListRef.current.querySelector(`[data-hotel-id="${selectedHotel.hotel_id}"]`);
      if (hotelElement) {
        hotelElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [selectedHotel]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HotelIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Seattle Hotels
                </h1>
                <p className="text-sm text-slate-600 font-medium">Find your accommodations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2">
                <MapPin className="w-4 h-4 mr-2" />
                {filteredHotels.length} hotels found
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-12">
        <div className="grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-240px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3 text-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search hotels by name or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={priceFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setPriceFilter('all')}
                      className={`h-10 ${priceFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80'}`}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={priceFilter === 'budget' ? 'default' : 'outline'}
                      onClick={() => setPriceFilter('budget')}
                      className={`h-10 ${priceFilter === 'budget' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80'}`}
                    >
                      Budget
                    </Button>
                    <Button
                      size="sm"
                      variant={priceFilter === 'mid' ? 'default' : 'outline'}
                      onClick={() => setPriceFilter('mid')}
                      className={`h-10 ${priceFilter === 'mid' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' : 'bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80'}`}
                    >
                      Mid-range
                    </Button>
                    <Button
                      size="sm"
                      variant={priceFilter === 'luxury' ? 'default' : 'outline'}
                      onClick={() => setPriceFilter('luxury')}
                      className={`h-10 ${priceFilter === 'luxury' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80'}`}
                    >
                      Luxury
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel List */}
            <div ref={hotelListRef} className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-2">
              {filteredHotels.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800">No hotels found</h3>
                    <p className="text-slate-600">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.hotel_id}
                    hotel={hotel}
                    isSelected={selectedHotel?.hotel_id === hotel.hotel_id}
                    onClick={() => setSelectedHotel(hotel)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white/80 backdrop-blur-md border-white/20 shadow-xl overflow-hidden">
              <CardContent className="p-0 h-full">
                <MapboxMap
                  hotels={filteredHotels}
                  selectedHotel={selectedHotel}
                  onHotelSelect={setSelectedHotel}
                  mapboxToken={mapboxToken}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
