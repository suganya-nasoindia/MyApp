import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator, Modal } from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from 'react-native';

// PC-hosted server:
// const BASE_URL =
//   Platform.OS === 'android'
//     ? 'http://10.0.2.2:5000'   // Android emulator -> host PC
//     : 'http://127.0.0.1:5000'; // iOS simulator or web

// If you test on a real Android device over Wi-Fi, use your PC's LAN IP, e.g.:
const BASE_URL = 'http://192.168.1.50:5000';

type Message = {
  text: string;
  sender: "user" | "bot";
  error?: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  //const API_URL = "http://10.67.179.209:11434/api/generate";
  const API_URL = "http://10.217.223.209:11434/api/generate";
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user's message
    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setLoading(true); // ✅ Show loader

    try {
      const res = await axios.post(`${BASE_URL}/chat`, {
        model: "tinyllama",
        prompt: input,
        stream: false
      });

      console.log(res.data); // Debug API response

      const botReply = res.data?.response || "No response";
      setMessages(prev => [...prev, { text: botReply, sender: "bot" }]);
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      setMessages(prev => [
        ...prev,
        { text: "Something went wrong", sender: "bot", error: errorMsg }
      ]);
    } finally {
      setLoading(false); // ✅ Hide loader
    }

    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Title */}
      <Text style={styles.title}>🤖 Chatbot (Local Server)</Text>

      {/* Messages */}
      <ScrollView style={styles.messages}>
        {messages.map((msg, i) => (
          <Text
            key={i}
            style={msg.sender === "user" ? styles.userMsg : styles.botMsg}
          >
            {msg.text}
            {msg.error && `\n(Error: ${msg.error})`}
          </Text>
        ))}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>

      {/* ✅ Progress Dialog */}
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={{ marginTop: 10 }}>Getting response...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#F9F9F9" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  messages: { flex: 1, marginBottom: 10 },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 8,
    marginVertical: 2,
    borderRadius: 8,
    maxWidth: "80%"
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
    padding: 8,
    marginVertical: 2,
    borderRadius: 8,
    maxWidth: "80%"
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: { flex: 1, borderColor: "#CCC", borderWidth: 1, borderRadius: 8, padding: 8, marginRight: 8 },
  
  // ✅ Modal Styles
  modalBackground: {
      flex: 1,
    alignItems: "center"
  },
  loaderContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center"
  }
});
