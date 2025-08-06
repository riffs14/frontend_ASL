import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2'; // Import Pie chart from react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; // Import necessary components from Chart.js

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ students }) => {
  const [chartData, setChartData] = useState({});

  // Prepare data for the pie chart
  useEffect(() => {
    const shiftCount = students.reduce((acc, student) => {
      const shift = student.shift_name || 'Unknown'; // Default to 'Unknown' if no shift data
      acc[shift] = (acc[shift] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(shiftCount);
    const data = Object.values(shiftCount);

    setChartData({
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C00'],
          hoverOffset: 4,
        },
      ],
    });
  }, [students]);

  return (
    <div>
      <h2>Student Distribution by Shift</h2>
      {Object.keys(chartData).length > 0 && (
        <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
};

export default PieChart;
