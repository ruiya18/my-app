import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_bookings: 0,
    total_reservations: 0,
    total_members: 0
  });

  const [weeklyBookingLabels, setWeeklyBookingLabels] = useState([]);
  const [weeklyBookingData, setWeeklyBookingData] = useState([]);

  const [weeklyReservationLabels, setWeeklyReservationLabels] = useState([]);
  const [weeklyReservationData, setWeeklyReservationData] = useState([]);

  const [equipmentStatus, setEquipmentStatus] = useState({
    instock: 0,
    damage: 0,
    missing: 0
  });

  useEffect(() => {
    axios.get('/api/dashboard-stats')
      .then(resp => setStats(resp.data))
      .catch(console.error);

    axios.get('/api/weekly-bookings')
      .then(resp => {
        setWeeklyBookingLabels(resp.data.labels);
        setWeeklyBookingData(resp.data.data);
      })
      .catch(console.error);

    axios.get('/api/weekly-reservations')
      .then(resp => {
        setWeeklyReservationLabels(resp.data.labels);
        setWeeklyReservationData(resp.data.data);
      })
      .catch(console.error);

    axios.get('/api/inventory-summary')
      .then(resp => setEquipmentStatus(resp.data))
      .catch(console.error);
  }, []);

  const bookingBarData = {
    labels: weeklyBookingLabels,
    datasets: [{
      label: 'Bookings',
      data: weeklyBookingData,
      backgroundColor: 'rgba(59,130,246,0.6)',
    }],
  };

  const reservationBarData = {
    labels: weeklyReservationLabels,
    datasets: [{
      label: 'Reservations',
      data: weeklyReservationData,
      backgroundColor: 'rgba(16,185,129,0.6)',
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
          <h3 className="text-lg font-semibold mb-2">Weekly Bookings</h3>
          <Bar data={bookingBarData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Equipment Status</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      {/* New Weekly Reservations */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Weekly Reservations</h3>
        <Bar data={reservationBarData} />
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