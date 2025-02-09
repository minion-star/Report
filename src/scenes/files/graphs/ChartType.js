import React, { useState } from "react";
import { Dialog, Tabs, Tab, Box, Typography, Card, CardContent, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Grid2 } from '@mui/material';
import Draggable from 'react-draggable';


function PaperComponent(props) {
    const nodeRef = React.useRef(null);
    return (
      <Draggable
        nodeRef={nodeRef}
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} ref={nodeRef} />
      </Draggable>
    );
  }


const chartCategories = [
  { label: "Line", key: "line",},
  { label: "Bar", key: "bar" },
  { label: "Pie", key: "pie" },
  { label: "Scatter", key: "scatter" },
  { label: "Area", key: "area" },
  { label: "Stock", key: "stock" },
  { label: "Radar", key: "radar" },
  { label: "Combo", key: "combo" },
];

const chartPreviews = {
  bar: [
    { title: "Basic Bar", img: "Basic Bar.png", type: "basicbar" },
    { title: "Basic Vertical Bar", img: "Basic Vertical Bar.png", type: "basicvertivalbar" },
  ],
  line: [{ title: "Basic Line Chart", img: "Basic Line Chart.png", type: "basiclinechart" },
        {title: "Smoothed Line Chart", img: "Smoothed Line Chart.png", type: "smoothedlinechart"},
        {title: "Stacked Line Chart", img: "Stacked Line Chart.png", type: "line"},
        {title: "Stacked Area Chart", img: "Stacked Area Chart.png", type: "line"},
  ],
  scatter: [{ title: "Scatter Chart", img: "Basic Scatter Chart.png", type:"scatter" }],
};

const ChartTypeDialog = ({ open, onClose, onSelectChart }) => {
  const [selectedTab, setSelectedTab] = useState("bar");


  const handleSelectChart = (chartType) => {
    onSelectChart(chartType);
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={()=>{}} PaperComponent={PaperComponent} PaperProps={{style: {width: 700, overflow: "hidden",},}}>
        <Box sx={{display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "green",
          color: "white",
          padding: "8px 8px",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          cursor:"move"
        }}
        id="draggable-dialog-title"
        >
          <Typography variant="h6">Chart Type</Typography>
            <IconButton aria-label="close" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
        </Box>
      <Box width={700} height={500} display="flex">
        {/* Sidebar for Chart Categories */}
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ borderRight: 1, borderColor: "divider", width: 150 }}
        >
          {chartCategories.map((category) => (
            <Tab key={category.key} label={category.label} value={category.key}/>
          ))}
        </Tabs>

        {/* Chart Preview Section */}
        <Box p={2} flex={1} sx={{backgroundColor:"gray"}}>
          <Typography variant="h2">{chartCategories.find(c => c.key === selectedTab)?.label}</Typography>
          <Grid2 container spacing={2}>
            {chartPreviews[selectedTab]?.map((chart, index) => (
              <Grid2 item xs={6} key={index}>
                <Card sx={{ cursor: "pointer", backgroundColor:"white" }} onClick={() => handleSelectChart(chart.type)}>
                  <CardContent>
                    <Typography>{chart.title}</Typography>
                    <img src={chart.img} alt={chart.title} width="100%" style={{ width: "150px", height: "100px", objectFit: "contain" }}  />
                  </CardContent>
                </Card>
              </Grid2>
            )) || <Typography>No charts available</Typography>}
          </Grid2>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ChartTypeDialog;
