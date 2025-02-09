import React, { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import * as echarts from "echarts";
import { Paper } from "@mui/material";

const GradientStackedAreaChart = ({ datasets, labels, chartId }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!datasets.length || !labels.length) return;

    const chartInstance = echarts.init(chartRef.current);
    const series = datasets.map((dataset, index) => ({
      type: "line",
      data: dataset.data,
      name: dataset.name,
      stack: "Total",
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: dataset.colorStart },
          { offset: 1, color: dataset.colorEnd },
        ]),
      },
    }));

    chartInstance.setOption({
      title: { text: "Gradient Stacked Area Chart" },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series,
    });

    return () => chartInstance.dispose();
  }, [datasets, labels]);

  return (
    <Draggable handle=".drag-handle">
      <Paper
        elevation={5}
        className="drag-handle"
        style={{
          position: "absolute",
          top: 300,
          left: 300,
          width: "500px",
          height: "350px",
          cursor: "move",
          zIndex: 1000,
        }}
      >
        <div ref={chartRef} id={chartId} style={{ width: "100%", height: "100%" }} />
      </Paper>
    </Draggable>
  );
};

export default GradientStackedAreaChart;
