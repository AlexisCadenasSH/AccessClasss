import { View, Text, ScrollView, Pressable, ImageBackground, SafeAreaView, Image } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import images from '@/constants/images';

const asistenciasData = [
  { fecha: '15/01/25', hora: '11:03', asistencia: true },
  { fecha: '15/01/25', hora: '15:00', asistencia: true },
  { fecha: '16/01/25', hora: '08:03', asistencia: true },
  { fecha: '16/01/25', hora: '14:03', asistencia: true },
  { fecha: '17/01/25', hora: '-- --', asistencia: false },
];

export default function Asistencias() {
  return (
    <SafeAreaView className="flex-1">
      <ImageBackground source={images.fondogris} className="flex-1" resizeMode="cover">
        <View className="bg-white/90 mx-4 my-6 p-4 rounded-2xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-red-800 text-2xl font-bold">Asistencias</Text>
            <Image source={images.logo} className="w-10 h-10" resizeMode="contain" />
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="bg-red-700 text-white text-xs px-3 py-1 rounded-md">FECHA</Text>
            <Text className="bg-red-700 text-white text-xs px-3 py-1 rounded-md">ENTRADA</Text>
            <Text className="bg-red-700 text-white text-xs px-3 py-1 rounded-md">ASISTENCIA</Text>
          </View>

          <ScrollView className="h-80">
            {asistenciasData.map((item, idx) => (
              <View
                key={idx}
                className="flex-row justify-between items-center px-3 py-2 my-1 rounded-xl bg-white/80"
              >
                <Text className="text-sm">{item.fecha}</Text>
                <Text className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">{item.hora}</Text>
                {item.asistencia ? (
                  <Text className="text-green-600 text-xl font-bold">✓</Text>
                ) : (
                  <Text className="text-red-600 text-xl font-bold">✗</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <Pressable
          onPress={() => router.push('/(root)/(tabs)/profile')}
          className="absolute bottom-6 right-6 bg-red-700 p-4 rounded-full shadow-lg"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </Pressable>
      </ImageBackground>
    </SafeAreaView>
  );
}


