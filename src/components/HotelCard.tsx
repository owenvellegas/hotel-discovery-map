import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Star, MapPin, Phone, Wifi, Car, Utensils, Dumbbell, Heart, Sparkles, ExternalLink } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  isSelected?: boolean;
  onClick?: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, isSelected, onClick }) => {
  const amenityIcons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="w-3 h-3" />,
    'Valet': <Car className="w-3 h-3" />,
    'Restaurant': <Utensils className="w-3 h-3" />,
    'Fitness': <Dumbbell className="w-3 h-3" />,
    'Pool': <Heart className="w-3 h-3" />,
    'Spa': <Heart className="w-3 h-3" />,
    'Bar': <Utensils className="w-3 h-3" />,
    'Pet-Friendly': <Heart className="w-3 h-3" />,
    'Business Center': <Wifi className="w-3 h-3" />,
    'Concierge': <Heart className="w-3 h-3" />
  };

  const getPriceColor = (price: number) => {
    if (price < 1000) return 'from-green-500 to-emerald-600';
    if (price < 1500) return 'from-orange-500 to-amber-600';
    return 'from-purple-500 to-pink-600';
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50' 
          : 'hover:shadow-xl bg-white/80 backdrop-blur-sm border-white/30'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0 overflow-hidden">
        <div className="relative">
          <div className="relative overflow-hidden">
            <img 
              src={hotel.image_url} 
              alt={hotel.name}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              <Badge className={`bg-gradient-to-r ${getPriceColor(hotel.price_per_night)} text-white font-bold px-3 py-1 shadow-lg border-0`}>
                ${hotel.price_per_night}
                <span className="text-xs ml-1">/night</span>
              </Badge>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-slate-800">{hotel.rating}</span>
                <span className="text-xs text-slate-600">({hotel.review_count})</span>
              </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Selected
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {hotel.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-3 text-slate-600">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium truncate">{hotel.address}</span>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {hotel.room_type}
            </p>
          </div>
          
          {/* Amenities */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => (
                <Badge 
                  key={amenity} 
                  variant="secondary" 
                  className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                >
                  {amenityIcons[amenity]}
                  {amenity}
                </Badge>
              ))}
              {hotel.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                  +{hotel.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Contact and Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">{hotel.star_rating}★ Hotel</span>
            </div>
            <Button 
              size="sm" 
              className={`ml-2 transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
              }`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;