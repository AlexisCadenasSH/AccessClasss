import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-bold  my-10 ChakraPetch-Italic text-3xl">Welcome to AccesClass</Text>
    </View>
  );
}
