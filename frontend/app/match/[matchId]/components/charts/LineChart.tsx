"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: Record<string, number>; // generic dataset
}

// Detect metric from first key (e.g., "Corners", "Cards")
function detectMetric(keys: string[]): string {
  if (keys.length === 0) return "Values";

  const key = keys[0];
  const match = key.match(/(Corners|Cards|Goals)/i);
  return match ? match[0].charAt(0).toUpperCase() + match[0].slice(1) : "Values";
}

// Format dataset keys into nice labels
function formatLabel(key: string): string {
  let formatted = key;

  // "over65" -> "Over 6.5"
  formatted = formatted.replace(/over(\d{2})(\d?)/, (_, a, b) => {
    if (b) return `Over ${a}.${b}`;
    return `Over ${a}`;
  });

  // Add spacing before capital letters (e.g., "over65Corners" -> "Over 6.5 Corners")
  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Handle suffix "_home" / "_away"
  if (formatted.includes("_home")) {
    formatted = formatted.replace("_home", " (Home)");
  } else if (formatted.includes("_away")) {
    formatted = formatted.replace("_away", " (Away)");
  }

  return formatted;
}

export default function LineChart({ data }: Props) {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const metric = detectMetric(keys); // auto-detected label

  const labels = keys.map(formatLabel);

  const chartData = {
    labels,
    datasets: [
      {
        label: metric,
        data: values,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        pointBackgroundColor: "rgba(75,192,192,1)",
        tension: 0.3, // smooth curves
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#000" },
      },
      title: {
        display: true,
        text: `${metric} Line Chart`,
      },
    },
    scales: {
      x: {
        ticks: { color: "#000", maxRotation: 45, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#000" },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
