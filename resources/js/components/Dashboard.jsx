import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_bookings: 0,
    total_reservations: 0,
    total_members: 0
  });

  const [bookingRange, setBookingRange] = useState('7days');
  const [reservationRange, setReservationRange] = useState('7days');
  
  const [bookingData, setBookingData] = useState({
    labels: [],
    data: [],
    type: 'line'
  });

  const [reservationData, setReservationData] = useState({
    labels: [],
    data: [],
    type: 'line'
  });

  const [equipmentStatus, setEquipmentStatus] = useState({
    instock: 0,
    damage: 0,
    missing: 0
  });

  const [topProducts, setTopProducts] = useState([]);

  const fetchBookingData = async (range) => {
    try {
      const resp = await axios.get(`/api/weekly-bookings?range=${range}`);
      setBookingData({
        labels: resp.data.labels,
        data: resp.data.data,
        type: range === 'today' || range === 'yesterday' ? 'bar' : 'line'
      });
    } catch (error) {
      console.error('Error fetching booking data:', error);
    }
  };

  const fetchReservationData = async (range) => {
    try {
      const resp = await axios.get(`/api/weekly-reservations?range=${range}`);
      setReservationData({
        labels: resp.data.labels,
        data: resp.data.data,
        type: range === 'today' || range === 'yesterday' ? 'bar' : 'line'
      });
    } catch (error) {
      console.error('Error fetching reservation data:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const resp = await axios.get('/api/top-products');
      setTopProducts(resp.data);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  useEffect(() => {
    axios.get('/api/dashboard-stats')
      .then(resp => setStats(resp.data))
      .catch(console.error);

    axios.get('/api/inventory-summary')
      .then(resp => setEquipmentStatus(resp.data))
      .catch(console.error);

    fetchBookingData(bookingRange);
    fetchReservationData(reservationRange);
    fetchTopProducts();
  }, []);

  useEffect(() => {
    fetchBookingData(bookingRange);
  }, [bookingRange]);

  useEffect(() => {
    fetchReservationData(reservationRange);
  }, [reservationRange]);

  const bookingChartData = {
    labels: bookingData.labels,
    datasets: [{
      label: 'Bookings',
      data: bookingData.data,
      backgroundColor: bookingData.type === 'bar' ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.2)',
      borderColor: 'rgba(59,130,246,1)',
      borderWidth: 2,
      fill: bookingData.type === 'line',
      tension: 0.4
    }],
  };

  const reservationChartData = {
    labels: reservationData.labels,
    datasets: [{
      label: 'Reservations',
      data: reservationData.data,
      backgroundColor: reservationData.type === 'bar' ? 'rgba(16,185,129,0.6)' : 'rgba(16,185,129,0.2)',
      borderColor: 'rgba(16,185,129,1)',
      borderWidth: 2,
      fill: reservationData.type === 'line',
      tension: 0.4
    }],
  };

  const doughnutData = {
    labels: ['Damage', 'In Stock', 'Missing'],
    datasets: [{
      data: [
        equipmentStatus.damage,
        equipmentStatus.instock,
        equipmentStatus.missing
      ],
      backgroundColor: ['#EF4444', '#10B981', '#F59E0B'],
    }],
  };

  const TimeRangeSelector = ({ value, onChange, type }) => (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => onChange('today')}
        className={`px-3 py-1 rounded text-sm ${
          value === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        Today
      </button>
      <button
        onClick={() => onChange('yesterday')}
        className={`px-3 py-1 rounded text-sm ${
          value === 'yesterday' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        Yesterday
      </button>
      <button
        onClick={() => onChange('7days')}
        className={`px-3 py-1 rounded text-sm ${
          value === '7days' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        7 Days
      </button>
      <button
        onClick={() => onChange('30days')}
        className={`px-3 py-1 rounded text-sm ${
          value === '30days' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        30 Days
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Bookings" value={stats.total_bookings} />
        <KpiCard title="Total Products" value={stats.total_products} />
        <KpiCard title="Total Members" value={stats.total_members} />
        <KpiCard title="Total Reservations" value={stats.total_reservations} />
      </div>

      {/* Top Row: Equipment Status + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equipment Status */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
          <Doughnut data={doughnutData} />
        </div>
        
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top 5 Picks Product</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider flex justify-center">
                    Total Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                        {product.total_quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Bookings + Reservations */}
      <div className="grid grid-cols-1 gap-4">
        {/* Bookings Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Bookings</h3>
            <TimeRangeSelector 
              value={bookingRange} 
              onChange={setBookingRange} 
              type="bookings" 
            />
          </div>
          {bookingData.type === 'bar' ? (
            <Bar data={bookingChartData} />
          ) : (
            <Line data={bookingChartData} />
          )}
        </div>

        {/* Reservations Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Reservations</h3>
            <TimeRangeSelector 
              value={reservationRange} 
              onChange={setReservationRange} 
              type="reservations" 
            />
          </div>
          {reservationData.type === 'bar' ? (
            <Bar data={reservationChartData} />
          ) : (
            <Line data={reservationChartData} />
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}