import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen"; // ✅ Importación correcta
import "@/app/global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Bebas_Neue": require("../assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
    "Big_Shoulders_Stencil_18pt-Black": require("../assets/fonts/Big_Shoulders_Stencil/static/BigShouldersStencil_18pt-Black.ttf"),
    "Big_Shoulders_Stencil_18pt-Bold": require("../assets/fonts/Big_Shoulders_Stencil/static/BigShouldersStencil_18pt-Bold.ttf"),
    "BigShouldersStencil_18pt-Light": require("../assets/fonts/Big_Shoulders_Stencil/static/BigShouldersStencil_18pt-Light.ttf"),
    "BigShouldersStencil_18pt-Medium": require("../assets/fonts/Big_Shoulders_Stencil/static/BigShouldersStencil_18pt-Medium.ttf"),
    "BigShouldersStencil-VariableFont_opsz,wght": require("../assets/fonts/Big_Shoulders_Stencil/BigShouldersStencil-VariableFont_opsz,wght.ttf"),
    "ChakraPetch-Bold": require("../assets/fonts/Chakra_Petch/ChakraPetch-Bold.ttf"),
    "ChakraPetch-Italic": require("../assets/fonts/Chakra_Petch/ChakraPetch-Italic.ttf"),
    "ChakraPetch-Light": require("../assets/fonts/Chakra_Petch/ChakraPetch-Light.ttf"),
    "ChakraPetch-Medium": require("../assets/fonts/Chakra_Petch/ChakraPetch-Medium.ttf"),
  });

  useEffect(() => {

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
}
