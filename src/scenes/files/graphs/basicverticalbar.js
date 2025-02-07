import React, { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import * as echarts from "echarts";
import { Paper } from "@mui/material";

const VerticalBarChart = ({ data, labels, chartId }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data.length || !labels.length) return;

    const chartInstance = echarts.init(chartRef.current);
    chartInstance.setOption({
      title: { text: "Vertical Bar Chart" },
      tooltip: {},
      xAxis: { type: "value" },
      yAxis: { type: "category", data: labels },
      series: [{ type: "bar", data, barWidth: "60%" }],
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

export default VerticalBarChart;
