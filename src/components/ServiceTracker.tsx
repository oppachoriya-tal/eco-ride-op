
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, 
  Battery, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import BookingModal from './BookingModal';

const ServiceTracker = () => {
  const [activeServices] = useState([
    {
      id: 1,
      type: 'Battery Replacement',
      scooterModel: 'EcoRide Pro',
      status: 'In Progress',
      progress: 75,
      estimatedCompletion: '2024-01-28',
      location: 'Service Center North',
      technician: 'Mike Johnson',
      phone: '+1 (555) 123-4567',
      updates: [
        { time: '10:00 AM', status: 'Service Started', description: 'Diagnostic check completed' },
        { time: '11:30 AM', status: 'Parts Ordered', description: 'New battery pack ordered' },
        { time: '02:15 PM', status: 'Installation', description: 'Installing new battery pack' },
      ]
    },
    {
      id: 2,
      type: 'Brake Adjustment',
      scooterModel: 'EcoRide Lite',
      status: 'Completed',
      progress: 100,
      estimatedCompletion: '2024-01-25',
      location: 'Service Center South',
      technician: 'Sarah Wilson',
      phone: '+1 (555) 987-6543',
      updates: [
        { time: '09:00 AM', status: 'Started', description: 'Initial inspection' },
        { time: '10:30 AM', status: 'Adjustment', description: 'Brake cable adjustment' },
        { time: '11:00 AM', status: 'Testing', description: 'Quality check and testing' },
        { time: '11:30 AM', status: 'Completed', description: 'Service completed successfully' },
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Tracker</h2>
          <p className="text-muted-foreground">Track your scooter service status</p>
        </div>
        <BookingModal type="service">
          <Button>
            <Wrench className="h-4 w-4 mr-2" />
            Book Service
          </Button>
        </BookingModal>
      </div>

      {/* Service Cards */}
      <div className="space-y-4">
        {activeServices.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {service.type === 'Battery Replacement' ? (
                    <Battery className="h-5 w-5 text-primary" />
                  ) : (
                    <Wrench className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{service.type}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.scooterModel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <Badge variant={getStatusColor(service.status) as any}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{service.progress}%</span>
                </div>
                <Progress value={service.progress} className="h-2" />
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Est. Completion</p>
                    <p className="font-medium">{service.estimatedCompletion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{service.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Technician</p>
                    <p className="font-medium">{service.technician}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Updates */}
              <div>
                <h4 className="font-medium mb-3">Service Updates</h4>
                <div className="space-y-3">
                  {service.updates.map((update, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{update.status}</span>
                          <span className="text-xs text-muted-foreground">{update.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {service.status === 'Completed' && (
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Rate Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Service Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BookingModal type="service">
              <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-2">
                <Battery className="h-6 w-6" />
                <span className="text-xs">Battery Service</span>
              </Button>
            </BookingModal>
            <BookingModal type="service">
              <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-2">
                <Wrench className="h-6 w-6" />
                <span className="text-xs">General Service</span>
              </Button>
            </BookingModal>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-xs">Health Check</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-xs">Emergency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTracker;
