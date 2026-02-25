import { useState } from "react";
import { useTempLogin } from "../hooks/useTempLogin";
import { ActivityIndicator, Button, Platform, TextInput, View } from "react-native";

export function TempLoginButton() {
  const [googleSub, setGoogleSub] = useState("");
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
    <View style={{ marginTop: 20, width: "100%" }}>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
          fontSize: 16,
        }}
        placeholder="Ingresa tu ID de usuario"
        value={googleSub}
        onChangeText={setGoogleSub}
        keyboardType="numeric"
        editable={!loginMutation.isPending}
      />

      {loginMutation.isPending ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Ingresar con Google (Sub)"
          disabled={!googleSub.trim()}
          onPress={handleTempLogin}
        />
      )}
    </View>
  );
}
