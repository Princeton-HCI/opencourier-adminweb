import { DefaultLayout } from '@/components/layouts/DefaultLayout';
import { useState } from 'react';
import { Button } from '@/admin-web-components';
import { useSimulateMatchingMutation } from '@/api/matchingApi';
import { ICourierMatcherResult } from '@/backend-admin-sdk/src/models'; // Import the type

const TestMatchingPage = () => {
  const [simulateMatching, { isLoading: matchingLoading }] = useSimulateMatchingMutation(); // Simulate matching mutation

  // State to hold the input for simulation
  const [deliveriesInput, setDeliveriesInput] = useState([
    {
      deliveryId: '123',
      pickupLocation: { latitude: 40.7128, longitude: -74.006 },
      dropoffLocation: { latitude: 40.73061, longitude: -73.935242 },
      rejectedCourierIds: ['456', '789'],
      contains: ['fragile'],
      restaurantTags: ['vegan'],
      totalCompensation: 50,
      area: 'Manhattan',
    },
    {
      deliveryId: '456',
      pickupLocation: { latitude: 34.0522, longitude: -118.2437 },
      dropoffLocation: { latitude: 34.0522, longitude: -120 },
      rejectedCourierIds: [],
      contains: ['perishable'],
      restaurantTags: ['gluten-free'],
      totalCompensation: 75,
      area: 'Los Angeles',
    },
  ]);

  // State to hold the results
  const [results, setResults] = useState<ICourierMatcherResult[][]>([]);

  // Handle Simulate Matching
  const handleSimulateMatching = async () => {
    try {
      const response = await simulateMatching(deliveriesInput).unwrap(); // Call the simulateMatching mutation
      
      console.log('API Response:', response);
      const extractedResults = Array.isArray(response) 
        ? response 
        : Object.values(response); // Convert object values to an array

      // Assuming the API returns results grouped by delivery
      setResults(extractedResults as ICourierMatcherResult[][]);
    } catch (error) {
      console.error('Error simulating matching:', error);
    }
  };

  return (
    <DefaultLayout>
       <h2 className="text-3xl font-medium tracking-tight">Test Matching</h2>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Current Deliveries Panel */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>Current Deliveries</h2>
          <ul>
            {deliveriesInput.map((delivery, index) => (
              <li key={index} style={{ marginBottom: '1rem' }}>
                <strong>Delivery ID:</strong> {delivery.deliveryId} <br />
                <strong>Pickup:</strong> {`(${delivery.pickupLocation.latitude}, ${delivery.pickupLocation.longitude})`} <br />
                <strong>Dropoff:</strong> {`(${delivery.dropoffLocation.latitude}, ${delivery.dropoffLocation.longitude})`} <br />
                <strong>Rejected Couriers:</strong> {delivery.rejectedCourierIds.join(', ')} <br />
                <strong>Tags:</strong> {delivery.contains.join(', ')} <br />
                <strong>Restaurant Tags:</strong> {delivery.restaurantTags.join(', ')} <br />
                <strong>Compensation:</strong> ${delivery.totalCompensation} <br />
                <strong>Area:</strong> {delivery.area}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 2, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>Matching Results</h2>
          {matchingLoading ? (
            <p>Loading...</p>
          ) : results.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Courier ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Delivery ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Distance</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Compensation</th>
                </tr>
              </thead>
              <tbody>
                {results.flat().filter((match) => match).map((match, index) => {
                  const delivery = deliveriesInput.find(d => d.deliveryId === match.deliveryId);
                  return (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{match.courierId}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{match.deliveryId}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{match.distance?.toFixed(2) || 'N/A'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>${delivery?.totalCompensation || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No results yet. Click 'Simulate Matching' to see results.</p>
          )}
        </div>
        </div>


      {/* Simulate Matching Button */}
      <div style={{ marginTop: '2rem' }}>
        <Button onClick={handleSimulateMatching} disabled={matchingLoading}>
          {matchingLoading ? 'Simulating...' : 'Simulate Matching'}
        </Button>
      </div>
    </DefaultLayout>
  );
};

export default TestMatchingPage;