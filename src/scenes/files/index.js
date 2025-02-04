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
  Typography,
  DialogActions,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Upload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import Handsontable from "handsontable";
import { HyperFormula } from 'hyperformula';
import "handsontable/dist/handsontable.full.css";
import ChatbotDrawer from "./ChatbotDrawer";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { registerAllModules } from 'handsontable/registry'
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

registerAllModules();


const Files = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [formulaDialog, setFormulaDialog] = useState(false);
  const [cloudDownloadDialog, setCloudDownloadDialog] = useState(false);
  const [cellInput, setCellInput] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [columns, setColumns] = useState([]);


  useEffect(() => {
    // Fetch schemas from API
    const fetchData = async() => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/get_all_schemas");
        const data = response.data;
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
        const response = await axios.get(`http://127.0.0.1:5000/api/get_all_columns/${selectedSchema}/${selectedTable}`);
        const data = response.data;
        setColumns(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    
    }
    fetchData();
  },[selectedSchema, selectedTable])
  const handleDisplayTable = async () => {
    if (selectedColumn.length === 0) {
      console.log("Please select at least one column.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/get_selected_columns/${selectedSchema}/${selectedTable}`,
        { columns: selectedColumn }
      );
  
      const backendData = response.data;
  
      // Convert backend data into a 2D array for Handsontable (add headers as the first row)
      const headers = selectedColumn;
      const formattedData = [headers, ...backendData.map((row) => headers.map((col) => row[col]))];
  
      // Add backend data as a new tab
      setFiles((prevFiles) => [...prevFiles, { name: `Backend Data - ${new Date().toLocaleTimeString()}`, data: formattedData }]);
  
      // Automatically switch to the new tab
      setActiveTab(files.length);  // Since a new file is added at the end
      setCloudDownloadDialog(false);
    } catch (error) {
      console.error("Error fetching data:", error);

    }
  };


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
      if (hotInstanceRef.current) {
        hotInstanceRef.current.destroy();  // Destroy previous instance
      }
      const hyperFormulaInstance = HyperFormula.buildEmpty({
        licenseKey: 'gpl-v3'  // GPL license for non-commercial use
      });
      hotInstanceRef.current = new Handsontable(hotTableRef.current, {
        data: files[activeTab].data,
        colHeaders: true,
        rowHeaders: true,
        width: "100%",
        height: "500px",
        licenseKey: "non-commercial-and-evaluation",
        contextMenu:true,
        formulas: {
          engine: hyperFormulaInstance  // This is the critical part
        },
        autoColumnSize: true,
      });
    }
    
  }, [files, activeTab]);

  const handleApplyFormula = () => {
    if (hotInstanceRef.current && cellInput && formulaInput) {
      const match = cellInput.toUpperCase().match(/([A-Z]+)([0-9]+)/);
      if (match) {
        const col = match[1].charCodeAt(0) - 65;
        const row = parseInt(match[2], 10) - 1;
        hotInstanceRef.current.setDataAtCell(row, col, `=${formulaInput}`);
        console.log(`Formula applied at (${row}, ${col}): =${formulaInput}`);
      }
    }
    setFormulaDialog(false);
    setCellInput('');
    setFormulaInput('');
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
          <Button><SaveOutlinedIcon/></Button>
        </ButtonGroup>
      </Box>

      {/* Dialog for Google Cloud Download */}
      <Dialog open={cloudDownloadDialog} onClose={() => {}} sx={{borderRadius:"16px",  "& .MuiDialog-paper": { width: "400px", height: "auto" },}}>
        <Box sx={{display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "green",
          color: "white",
          padding: "8px 8px",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
        }}
        >
          <Typography variant="h6">Download from Google Cloud</Typography>
            <IconButton aria-label="close" color="inherit" onClick={() => setCloudDownloadDialog(false)}>
              <CloseIcon />
            </IconButton>
        </Box>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Schema</InputLabel>
            <Select value={selectedSchema} onChange={(e) => setSelectedSchema(e.target.value)}>
            {schemas.map((schema) => (
            <MenuItem key={schema} value={schema}>{schema}</MenuItem>
          ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Table</InputLabel>
            <Select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              {tables.map((table) => (
              <MenuItem key={table} value={table}>{table}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Column</InputLabel>
            <Select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} multiple>
              {columns.map((column) => (
              <MenuItem key={column} value={column}>{column}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="contained" color="secondary" onClick={handleDisplayTable}>Upload</Button>
            <Button variant="outlined"  color="error" onClick={() => setCloudDownloadDialog(false)}>Cancel</Button>
          </Box>
        </DialogContent>
      </Dialog>


      {/* Dialog for Formula Input */}
      <Dialog open={formulaDialog} onClose={() => setFormulaDialog(false)}>
        <DialogTitle>Enter Formula</DialogTitle>
        <DialogContent>
          <TextField
            label="Cell (e.g., A1)"
            fullWidth
            value={cellInput}
            onChange={(e) => setCellInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Formula (e.g., VLOOKUP(10, A1:B10, 2, FALSE))"
            fullWidth
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            helperText="Supports VLOOKUP, XLOOKUP, HLOOKUP, IF, AND, OR, NOT, XOR, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormulaDialog(false)}>Cancel</Button>
          <Button onClick={handleApplyFormula} variant="contained" color="primary">Apply</Button>
        </DialogActions>
      </Dialog>
      
      {/* Tabs for Uploaded Files and Backend Data */}
      {files.length > 0 && (
        <AppBar position="static" sx={{ mt: 3, backgroundColor: colors.blueAccent[700] }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            {files.map((file, index) => (
              <Tab key={index} label={file.name} sx={{ color: colors.primary[100] }} />
            ))}
          </Tabs>
        </AppBar>
      )}

      
      {/* Handsontable Display */}
      <Box ref={hotTableRef} />

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
