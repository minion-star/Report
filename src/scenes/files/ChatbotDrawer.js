import React, { useState } from "react";
import { Drawer, Avatar, DialogTitle, DialogContent, TextField, Button, List, ListItem, ListItemAvatar, ListItemText, Box } from "@mui/material";

const ChatbotDrawer = ({ open, setOpen }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const botResponse = { sender: "bot", text: "I'm here to assist you!" };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000); // Simulated bot response delay

    setInput("");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ sx: { width: "83%", display: "flex", flexDirection: "column" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar alt="chatbot" src="/chatbot.png" />
      </DialogTitle>

      {/* Chat Area */}
      <DialogContent sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} sx={{ justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              {msg.sender === "bot" && (
                <ListItemAvatar>
                  <Avatar alt="chatbot" src="/chatbot.png" />
                </ListItemAvatar>
              )}
              <ListItemText
                primary={msg.text}
                sx={{
                  backgroundColor: msg.sender === "user" ? "#1976d2" : "#eeeeee",
                  color: msg.sender === "user" ? "white" : "black",
                  borderRadius: 2,
                  padding: 1,
                  maxWidth: "70%",
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

     
    </Drawer>
  );
};

export default ChatbotDrawer;
