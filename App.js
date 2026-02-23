import React, { useEffect } from "react";
import { Button, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "",
  });

  useEffect(() => {
    if (response) {
    console.log("FULL RESPONSE:");
    console.log(JSON.stringify(response, null, 2));
  }
  if (request) {
    console.log("FULL REQUEST:");
    console.log(JSON.stringify(request, null, 2));
  }
  }, [response]);

  return (
    <View style={{ marginTop: 100 }}>
      <Button
        title="Login con Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
    </View>
  );
}