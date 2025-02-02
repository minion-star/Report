import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  AppBar,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Drawer,
  Avatar,
  IconButton,
  useTheme,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import { Upload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import * as formulaJS from "formulajs";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import ChatbotDrawer from "./ChatbotDrawer";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';


const Files = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [formulaDialog, setFormulaDialog] = useState(false);
  const [cloudDownloadDialog, setCloudDownloadDialog] = useState(false);
  const [formula, setFormula] = useState("");
  const hotTableRef = useRef(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [columns, setColumns] = useState([]);
  const [displayChart, setDisplayChart] = useState(null);
  const [displayTable, setDisplayTable] = useState(null);

  useEffect(() => {
    // Fetch schemas from API
    const fetchData = async() => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/get_all_schemas");
        const data = response.data;
        console.log("schemas", data);
        setSchemas(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(()=>{
    const fetchData = async() => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/get_all_schemas/${selectedSchema}`);
        const data = response.data;
        console.log("tables", data);
        setTables(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    
    }
    fetchData();
  },[selectedSchema])

  useEffect(()=>{
    const fetchData = async() => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/get_all_schemas/${selectedSchema}/${selectedTable}`);
        const data = response.data;
        console.log("columns", data);
        setTables(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    
    }
    fetchData();
  },[selectedSchema, selectedTable])
  const handleDisplayChart = () =>{
    setDisplayChart(true);
  }

  const handleDisplayTable = () =>{
    setDisplayTable(true);
  }

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    uploadedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        setFiles((prev) => [...prev, { name: file.name, data: sheet }]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  useEffect(() => {
    if (hotTableRef.current && files.length > 0) {
      new Handsontable(hotTableRef.current, {
        data: files[activeTab].data,
        colHeaders: true,
        rowHeaders: true,
        width: "100%",
        height: "500px",
        licenseKey: "non-commercial-and-evaluation",
      });
    }
  }, [files, activeTab]);

  const applyFormula = () => {
    try {
      const result = formulaJS.SUM ? formulaJS.SUM([10, 20, 30]) : "Formula not found";
      alert(`Formula result: ${result}`);
    } catch (error) {
      alert("Invalid Formula");
    }
    setFormulaDialog(false);
  };

  return (
    <Box m="20px">
      <Header title="FILES" subtitle="Manage and View Your Excel Files" />

      {/* Buttons Section */}
      <Box display="flex">
        <ButtonGroup variant="contained" component="span" color="success">
          <Button onClick={() => fileInputRef.current.click()}><Upload /></Button>
          <Button onClick={() => setFormulaDialog(true)}><FunctionsOutlinedIcon/></Button>
          <Button onClick={() => setCloudDownloadDialog(true)}><CloudDownloadOutlinedIcon /></Button>
        </ButtonGroup>
      </Box>

      {/* Dialog for Google Cloud Download */}
      <Dialog open={cloudDownloadDialog} onClose={() => {}}>
        <DialogTitle>Google Cloud Download</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Schema</InputLabel>
            <Select value={selectedSchema} onChange={(e) => setSelectedSchema(e.target.value)}>
            {schemas.map((key) => (
            <MenuItem key={key} value={key}>{key}</MenuItem>
          ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Table</InputLabel>
            <Select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              {tables.map((key) => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Column</InputLabel>
            <Select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
              {columns.map((key) => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="contained" color="secondary" onClick={handleDisplayChart}>Chart</Button>
            <Button variant="contained" color="secondary" onClick={handleDisplayTable}>Table</Button>
            <Button variant="outlined"  color="error" onClick={() => setCloudDownloadDialog(false)}>Cancel</Button>
          </Box>
        </DialogContent>
      </Dialog>


      {/* Dialog for Formula Input */}
      <Dialog open={formulaDialog} onClose={() => setFormulaDialog(false)}>
        <DialogTitle>Enter Formula</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Formula"
            variant="outlined"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
          />
          <Button
            onClick={applyFormula}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Apply
          </Button>
        </DialogContent>
      </Dialog>

      {/* Tabs for Files */}
      {files.length > 0 && (
        <AppBar position="static" sx={{ mt: 3, backgroundColor: colors.blueAccent[700] }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            {files.map((file, index) => (
              <Tab key={index} label={file.name} sx={{ color: colors.primary[100] }} />
            ))}
          </Tabs>
        </AppBar>
      )}

      {/* Handsontable Spreadsheet Display */}
      <Box ref={hotTableRef}/>

      {/* File Upload Input */}
      <input
        ref={fileInputRef}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        multiple
        type="file"
        onChange={handleFileUpload}
      />

      {/* Chatbot Button */}
      <IconButton
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          backgroundColor: colors.primary[400],
          "&:hover": { backgroundColor: colors.blueAccent[400] },
        }}
        onClick={() => setOpen(true)}
        size="small"
      >
        <Avatar alt="chatbot" src="/chatbot.png" />
      </IconButton>

      {/* Chatbot Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: "83%", backgroundColor: colors.primary[400] } }}
      >
        <Box p={2} display="flex" alignItems="center" gap={1}>
          <Avatar alt="chatbot" src="/chatbot.png" />
        </Box>
        <ChatbotDrawer open={open} setOpen={setOpen} />
      </Drawer>
    </Box>
  );
};

export default Files;
