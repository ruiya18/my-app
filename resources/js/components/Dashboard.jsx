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

  useEffect(() => {
    axios.get('/api/dashboard-stats')
      .then(resp => setStats(resp.data))
      .catch(console.error);

    axios.get('/api/inventory-summary')
      .then(resp => setEquipmentStatus(resp.data))
      .catch(console.error);

    fetchBookingData(bookingRange);
    fetchReservationData(reservationRange);
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow lg:col-span-2">
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
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
          <Doughnut data={doughnutData} />
        </div>
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