
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Gauge, 
  Clock, 
  Weight, 
  Ruler, 
  Shield,
  Star,
  DollarSign
} from 'lucide-react';
import BookingModal from './BookingModal';

const ModelComparison = () => {
  const models = [
    {
      name: 'EcoRide Lite',
      price: '$899',
      rating: 4.2,
      image: '/placeholder.svg',
      category: 'Budget-Friendly',
      specs: {
        maxSpeed: '20 km/h',
        range: '25 km',
        chargingTime: '4 hours',
        weight: '12 kg',
        maxLoad: '100 kg',
        waterRating: 'IP54'
      },
      features: ['LED Headlight', 'Foldable Design', 'App Connectivity', 'Anti-theft Alarm'],
      pros: ['Affordable price', 'Lightweight', 'Easy to fold'],
      cons: ['Lower max speed', 'Basic features']
    },
    {
      name: 'EcoRide Pro',
      price: '$1,299',
      rating: 4.8,
      image: '/placeholder.svg',
      category: 'Premium',
      specs: {
        maxSpeed: '25 km/h',
        range: '45 km',
        chargingTime: '5 hours',
        weight: '15 kg',
        maxLoad: '120 kg',
        waterRating: 'IP65'
      },
      features: ['Dual LED Lights', 'Suspension', 'App Control', 'GPS Tracking', 'Regenerative Braking'],
      pros: ['Excellent range', 'Premium build', 'Advanced features', 'Smooth ride'],
      cons: ['Higher price', 'Heavier weight']
    },
    {
      name: 'EcoRide Sport',
      price: '$1,599',
      rating: 4.6,
      image: '/placeholder.svg',
      category: 'Performance',
      specs: {
        maxSpeed: '30 km/h',
        range: '35 km',
        chargingTime: '4.5 hours',
        weight: '16 kg',
        maxLoad: '130 kg',
        waterRating: 'IP65'
      },
      features: ['Sport Mode', 'Dual Motors', 'Premium Suspension', 'Digital Display', 'Fast Charging'],
      pros: ['Highest speed', 'Dual motors', 'Sport performance', 'Fast acceleration'],
      cons: ['Most expensive', 'Shorter range than Pro']
    }
  ];

  const getSpecIcon = (spec: string) => {
    switch (spec) {
      case 'maxSpeed': return <Gauge className="h-4 w-4" />;
      case 'range': return <Zap className="h-4 w-4" />;
      case 'chargingTime': return <Clock className="h-4 w-4" />;
      case 'weight': return <Weight className="h-4 w-4" />;
      case 'maxLoad': return <Ruler className="h-4 w-4" />;
      case 'waterRating': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  const getSpecLabel = (spec: string) => {
    switch (spec) {
      case 'maxSpeed': return 'Max Speed';
      case 'range': return 'Range';
      case 'chargingTime': return 'Charging Time';
      case 'weight': return 'Weight';
      case 'maxLoad': return 'Max Load';
      case 'waterRating': return 'Water Rating';
      default: return spec;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Compare EcoRide Models</h2>
        <p className="text-muted-foreground">Find the perfect scooter for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.name} className="relative">
            <CardHeader className="pb-4">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">{model.category}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{model.price}</div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">{model.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Specifications */}
              <div>
                <h4 className="font-medium mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(model.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {getSpecIcon(key)}
                      <div>
                        <div className="text-muted-foreground text-xs">{getSpecLabel(key)}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pros & Cons */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-green-600 mb-1">Pros</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {model.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-orange-600 mb-1">Cons</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {model.cons.map((con) => (
                      <li key={con} className="flex items-start gap-1">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <BookingModal type="test-ride">
                  <Button variant="outline" size="sm" className="w-full">
                    Test Ride
                  </Button>
                </BookingModal>
                <BookingModal type="purchase">
                  <Button size="sm" className="w-full">
                    Buy Now
                  </Button>
                </BookingModal>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModelComparison;
