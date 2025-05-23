import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";

export default function AppLayout() {
    const{ loading, isLoggedIn } = useGlobalContext();

    if(loading) {
        return (
            <SafeAreaView className="bg-while h-full flex justify-center items-center">
                <ActivityIndicator className="text- primary-300" size="large" />
            </SafeAreaView>
        )
    }

    if(!isLoggedIn) return <Redirect href='/sign_in' />

    return <Slot />
}