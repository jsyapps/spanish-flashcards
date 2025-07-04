import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import FlashcardModal from "../components/FlashcardModal";

export default function Index() {
  const [inputText, setInputText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const sendMessage = async () => {
    if (inputText.trim()) {
      setUserMessage(inputText.trim());
      setResponse(""); // Clear previous response
      setInputText("");
      Keyboard.dismiss(); // Close the keyboard
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputText.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setResponse(data.response);
      } catch (error) {
        console.error('Error:', error);
        setResponse("Sorry, I couldn't get a response. Please try again.");
      }
    }
  };

  const openFlashcardModal = () => {
    setModalVisible(true);
  };

  const handleFlashcardSaved = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        
      >
        
        
        <ScrollView style={styles.responseContainer}>
          {userMessage ? (
            <>
              <View style={styles.userMessageBox}>
                <Text style={styles.userMessageText}>{userMessage}</Text>
              </View>
              {response ? (
                <>
                  <View style={styles.responseBox}>
                    <Text style={styles.responseText}>{response}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={openFlashcardModal}
                  >
                    <Text style={styles.saveButtonText}>Save as Flashcard</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.loadingBox}>
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ask a question to get started!</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <FlashcardModal
          visible={modalVisible}
          userMessage={userMessage}
          response={response}
          onSave={handleFlashcardSaved}
          onCancel={() => setModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  
  responseContainer: {
    flex: 1,
    padding: 15,
  },
  userMessageBox: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    
    maxWidth: "100%",
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "white",
  },
  responseBox: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  
    maxWidth: "100%",
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  loadingBox: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  loadingText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
