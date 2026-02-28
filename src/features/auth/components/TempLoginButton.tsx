import { useState } from "react";
import { useTempLogin } from "../hooks/useTempLogin";
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function TempLoginButton() {
  const [googleSub, setGoogleSub] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useTempLogin();

  if (Platform.OS === "web") {
    return null; // No mostrar el botón en web
  }

  const handleTempLogin = () => {
    if (googleSub.trim()) {
      loginMutation.mutate(googleSub.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ID de usuario (desarrollo)"
          placeholderTextColor="#999"
          value={googleSub}
          onChangeText={setGoogleSub}
          keyboardType="numeric"
          editable={!loginMutation.isPending}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={[styles.eyeIcon]}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#D9B97E"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (!googleSub.trim() || loginMutation.isPending) && styles.buttonDisabled
        ]}
        disabled={!googleSub.trim() || loginMutation.isPending}
        onPress={handleTempLogin}
        activeOpacity={0.8}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator size="small" color="#D9B97E" />
        ) : (
          <>
            <Ionicons name="key-outline" size={20} color="#D9B97E" />
            <Text style={styles.buttonText}>Acceso Temporal</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(217, 185, 126, 0.3)",
    borderRadius: 10,
    padding: 14,
    paddingRight: 50,
    fontSize: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 9,
    padding: 4,
  },
  button: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D9B97E",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#D9B97E",
    fontSize: 15,
    fontWeight: "600",
  },
});
