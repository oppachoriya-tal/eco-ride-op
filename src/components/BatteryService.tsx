
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Battery, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingDown,
  Calendar,
  MapPin
} from 'lucide-react';
import BookingModal from './BookingModal';

const BatteryService = () => {
  const [batteryData] = useState({
    currentHealth: 78,
    cycleCount: 342,
    lastService: '2023-11-15',
    warrantyStatus: 'Active',
    warrantyExpiry: '2025-12-31',
    estimatedLifeRemaining: '18 months'
  });

  const getBatteryHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBatteryHealthStatus = (health: number) => {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Fair';
    return 'Poor';
  };

  const getRecommendation = (health: number) => {
    if (health >= 80) return 'Your battery is in excellent condition. Continue regular maintenance.';
    if (health >= 60) return 'Battery health is good. Consider service checkup in next 3 months.';
    if (health >= 40) return 'Battery showing signs of wear. Schedule service appointment soon.';
    return 'Battery replacement recommended. Book service appointment immediately.';
  };

  const batteryTips = [
    {
      title: 'Optimal Charging',
      description: 'Charge between 20% and 80% for best battery longevity',
      icon: <Zap className="h-4 w-4" />
    },
    {
      title: 'Temperature Care',
      description: 'Store in temperatures between 10°C and 25°C',
      icon: <Battery className="h-4 w-4" />
    },
    {
      title: 'Regular Use',
      description: 'Use your scooter regularly to maintain battery health',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: 'Avoid Deep Discharge',
      description: 'Don\'t let battery drop below 10% frequently',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  const serviceHistory = [
    {
      date: '2023-11-15',
      type: 'Health Check',
      health: '82%',
      notes: 'Battery performance within normal range'
    },
    {
      date: '2023-08-22',
      type: 'Calibration',
      health: '85%',
      notes: 'Battery recalibrated, charging optimized'
    },
    {
      date: '2023-05-10',
      type: 'General Service',
      health: '87%',
      notes: 'Full service including battery inspection'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Battery Service</h2>
          <p className="text-muted-foreground">Monitor and maintain your battery health</p>
        </div>
        <BookingModal type="service">
          <Button>
            <Battery className="h-4 w-4 mr-2" />
            Book Battery Service
          </Button>
        </BookingModal>
      </div>

      {/* Battery Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Battery Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getBatteryHealthColor(batteryData.currentHealth)}`}>
                  {batteryData.currentHealth}%
                </span>
                <Badge variant="outline">
                  {getBatteryHealthStatus(batteryData.currentHealth)}
                </Badge>
              </div>
              <Progress value={batteryData.currentHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Cycle Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold">{batteryData.cycleCount}</span>
              <p className="text-xs text-muted-foreground">cycles completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Est. Life Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold">{batteryData.estimatedLifeRemaining}</span>
              <p className="text-xs text-muted-foreground">under normal usage</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Warranty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={batteryData.warrantyStatus === 'Active' ? 'default' : 'destructive'}>
                {batteryData.warrantyStatus}
              </Badge>
              <p className="text-xs text-muted-foreground">Until {batteryData.warrantyExpiry}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battery Recommendation */}
      <Alert>
        <Battery className="h-4 w-4" />
        <AlertDescription>
          {getRecommendation(batteryData.currentHealth)}
        </AlertDescription>
      </Alert>

      {/* Battery Care Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Battery Care Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batteryTips.map((tip, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border bg-card/50">
                <div className="flex-shrink-0 text-primary">{tip.icon}</div>
                <div>
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceHistory.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{service.type}</p>
                    <p className="text-xs text-muted-foreground">{service.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{service.health}</Badge>
                  <p className="text-xs text-muted-foreground mt-1 max-w-48">{service.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Battery Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <BookingModal type="service">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Battery className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Battery Replacement</p>
                  <p className="text-xs text-muted-foreground">New battery installation</p>
                </div>
              </Button>
            </BookingModal>
            
            <BookingModal type="service">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Health Check</p>
                  <p className="text-xs text-muted-foreground">Complete battery diagnostic</p>
                </div>
              </Button>
            </BookingModal>
            
            <BookingModal type="service">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Zap className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Calibration</p>
                  <p className="text-xs text-muted-foreground">Optimize charging cycles</p>
                </div>
              </Button>
            </BookingModal>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatteryService;
