import React, { useState, useRef, useEffect } from "react";
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
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import { Upload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import ChatbotDrawer from "./ChatbotDrawer";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { registerAllModules } from "handsontable/registry";
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import HyperFormula from "hyperformula";

registerAllModules();

const Files = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [formulaDialog, setFormulaDialog] = useState(false);
  const [formula, setFormula] = useState("");
  const hotTableRef = useRef(null);
  const [open, setOpen] = useState(false);
  const hyperformulaInstance = useRef(null);
  const [selectedCell, setSelectedCell] = useState(null);

  

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
    // Initialize HyperFormula
    if (!hyperformulaInstance.current) {
      hyperformulaInstance.current = HyperFormula.buildEmpty();
    }

    if (hotTableRef.current && files.length > 0) {
      new Handsontable(hotTableRef.current, {
        data: files[activeTab].data,
        colHeaders: true,
        rowHeaders: true,
        width: "100%",
        height: "500px",
        licenseKey: "non-commercial-and-evaluation",
        formulas: {
          engine: hyperformulaInstance.current, // Use HyperFormula
        },
        contextMenu: true, // Enable right-click menu
        manualRowMove: true,
        manualColumnMove: true,
        filters: true,
        dropdownMenu: true,
        columnSorting: true,
        allowInsertRow: true,
        allowInsertColumn: true,
        afterSelection: (row, col) => {
          setSelectedCell({ row, col }); // Store selected cell
        },
      });
    }
  }, [files, activeTab]);

  const applyFormula = () => {
    if (!selectedCell) {
      alert("Please select a cell first.");
      return;
    }

    try {
      const { row, col } = selectedCell;
      const hotInstance = Handsontable.getInstance(hotTableRef.current);
      hotInstance.setDataAtCell(row, col, formula); // Apply formula to selected cell
    } catch (error) {
      alert("Invalid Formula");
    }
    setFormulaDialog(false);
  };
  return (
    <Box m="20px">
      <Header title="FILES" subtitle="Manage and View Your Excel Files" />

      {/* Buttons Section */}
      <Box display="flex" gap={2} mt={2}>
        <label htmlFor="upload-excel">
          <Button
            variant="contained"
            component="span"
            startIcon={<Upload />}
            sx={{ backgroundColor: colors.greenAccent[600] }}
          >
            Upload Excel
          </Button>
        </label>

        <Button
          variant="contained"
          sx={{ backgroundColor: colors.greenAccent[600]}}
          onClick={() => setFormulaDialog(true)}
          startIcon={<FunctionsOutlinedIcon />}
        >
          Apply Formula
        </Button>

        <label htmlFor="fetch-data-gcp">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudDownloadOutlinedIcon />}
            sx={{ backgroundColor: colors.blueAccent[600] }}
          >
            GCP BQ
          </Button>
        </label>
      </Box>

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
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        id="upload-excel"
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
