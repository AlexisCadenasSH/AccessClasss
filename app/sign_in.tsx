import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import { login } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect } from 'expo-router';

const SignIn = () => {
  
  const { refetch, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) return <Redirect href="/" />

  const handleLogin = async () => {
    const result = await login();

    if (result) {
      refetch();
      console.log('Login Success');
    } else {
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <SafeAreaView className="h-full">
      <ImageBackground source={images.fondogris} className="flex-1 justify-center items-center">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View className='m-10 bg-white w-5/6 flex flex-col p-2 justify-center items-center rounded-lg opacity-90'>
            <View className="px-6 py-3 rounded-lg">
              <Text className="text-black-300 text-5xl text-center font-bold my-10">Iniciar Sesión</Text>
            </View>
            <Image source={images.logo} className='my-4' />
            <Text>Pasemos lista rápidamente</Text>
            <TouchableOpacity onPress={handleLogin} className="mt-5 mb-10">
              <View className="w-60 h-16 flex flex-row border border-red-100 rounded-full items-center justify-start px-4 bg-white shadow-md">
                <Image source={images.google} className="w-10 h-10 rounded-full mr-4" />
                <Text className="text-lg font-semibold text-gray-700">Login with Google</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SignIn; 
