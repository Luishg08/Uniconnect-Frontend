import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { useLogin } from "../hooks/useLogin";
import * as AuthSession from "expo-auth-session";
import { TempLoginButton } from "./TempLoginButton";

console.log(AuthSession.makeRedirectUri());

WebBrowser.maybeCompleteAuthSession();

export function GoogleLoginButton() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const loginMutation = useLogin();

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        loginMutation.mutate(accessToken);
      }
    }
  }, [response]);

  return (
    <View>
    <View style={{ marginTop: 20 }}>
      {loginMutation.isPending ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Ingresar con Google"
          disabled={!request}
          onPress={() => promptAsync()}
        />
      )}
    </View>
    <TempLoginButton />
    </View>
  );
}
