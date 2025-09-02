"use client";

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useRef, useEffect } from "react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarDataset {
  data: Record<string, number>;
  label: string;
  color?: string; // optional custom color (in RGB format: "37, 99, 235")
}

interface RadarChartProps {
  datasets: RadarDataset[];
  centerImage?: string;
  minRank?: number;
  maxRank?: number;        // max value for radar scale
  imageOpacity?: number;   // transparency for the center image (0-1)
  reverseAxis?: boolean;   // visually flip the radial axis
}

// 🔹 Generate distinct colors automatically
function generateColor(index: number): string {
  const hue = (index * 137.508) % 360; // golden angle to spread colors
  return `hsl(${hue}, 70%, 50%)`
    .replace("hsl(", "")
    .replace(")", "")
    .replace(/%/g, "") // convert to RGB-like format (approx)
    .split(",")
    .map((v) => parseInt(v.trim()))
    .slice(0, 3)
    .join(", ");
}

export default function RadarChart({
  datasets,
  centerImage,
  minRank = 0,
  maxRank = 20,
  imageOpacity = 0.1,
  reverseAxis = false,
}: RadarChartProps) {
  const chartRef = useRef<any>(null);

  if (!datasets || datasets.length === 0) {
    return <p className="text-gray-500">Loading chart...</p>;
  }

  // assume all datasets share the same keys
  const labels = Object.keys(datasets[0].data);

  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => {
      const color = ds.color ?? generateColor(i);
      return {
        label: ds.label,
        data: Object.values(ds.data),
        backgroundColor: `rgba(${color}, 0.25)`,
        borderColor: `rgba(${color}, 1)`,
        borderWidth: 2,
        pointBackgroundColor: `rgba(${color}, 1)`,
      };
    }),
  };

  const chartOptions: ChartOptions<"radar"> = {
    responsive: true,
    scales: {
      r: {
        min: minRank,
        max: maxRank,
        reverse: reverseAxis,
        ticks: {
          stepSize: Math.ceil(maxRank / 4),
        },
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
    },
  };

  const centerImagePlugin = {
    id: "centerImagePlugin",
    beforeDatasetsDraw: (chart: any) => {
      if (!centerImage) return;

      const ctx = chart.ctx;
      const { left, right, top, bottom } = chart.chartArea;
      const xCenter = (left + right) / 2;
      const yCenter = (top + bottom) / 2;

      const image = new Image();
      image.src = centerImage;

      image.onload = () => {
        const size = Math.min(right - left, bottom - top) * 0.25;
        ctx.save();
        ctx.globalAlpha = imageOpacity;
        ctx.beginPath();
        ctx.arc(xCenter, yCenter, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, xCenter - size / 2, yCenter - size / 2, size, size);
        ctx.restore();
      };
    },
  };

  useEffect(() => {
    if (chartRef.current) chartRef.current.update();
  }, [datasets, centerImage, imageOpacity, reverseAxis]);

  return <Radar ref={chartRef} data={chartData} options={chartOptions} plugins={[centerImagePlugin]} />;
}
