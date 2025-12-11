import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Clock, User, Building2, MapPin, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Reservation {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  location: string;
  userId: number;
  companyId: number;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  company: {
    id: number;
    name: string;
    address: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const ReservationView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/reservations/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reservation');
        }
        const data = await response.json();
        setReservation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReservation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Reservation Not Found</h1>
          <p className="text-gray-600 mb-6">The requested reservation could not be found.</p>
          <Button onClick={() => router.push('/reservations')}>
            View All Reservations
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex space-x-2">
          <Link href={`/reservations/edit/${reservation.id}`} passHref>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{reservation.title}</CardTitle>
              <CardDescription className="mt-1">
                Reservation ID: {reservation.id}
              </CardDescription>
            </div>
            {getStatusBadge(reservation.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{formatDate(reservation.startTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p>
                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Reserved by</p>
                  <p>{reservation.user.name || reservation.user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p>{reservation.company.name}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{reservation.location}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                <Badge variant="outline" className="capitalize">
                  {reservation.type.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          {reservation.description && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Additional Details</h3>
              <p className="text-gray-700 whitespace-pre-line">{reservation.description}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          <p>Created on {format(new Date(reservation.createdAt), 'MMMM d, yyyy')}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default ReservationView;
