import React, { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import * as echarts from "echarts";
import { Paper } from "@mui/material";

const SmoothLineChart = ({ data, labels, chartId }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data.length || !labels.length) return;

    const chartInstance = echarts.init(chartRef.current);
    chartInstance.setOption({
      title: { text: "Smooth Line Chart" },
      tooltip: {},
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series: [{ type: "line", data, smooth: true }],
    });

    return () => chartInstance.dispose();
  }, [data, labels]);

  return (
    <Draggable handle=".drag-handle">
      <Paper
        elevation={5}
        className="drag-handle"
        style={{
          position: "absolute",
          top: 300,
          left: 300,
          width: "400px",
          height: "300px",
          cursor: "move",
          zIndex: 1000,
        }}
      >
        <div ref={chartRef} id={chartId} style={{ width: "100%", height: "100%" }} />
      </Paper>
    </Draggable>
  );
};

export default SmoothLineChart;
