import { View, Text, SafeAreaView, ScrollView, ImageBackground, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AsistenciasScreen() {
  const { id_materia, userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [asistencias, setAsistencias] = useState<any[]>([]);

  let user_Id = Number(userId);
  let idMateria = Number(id_materia);

  useEffect(() => {
    const fetchAsistencias = async () => {
      if (!id_materia || !userId) {
        Alert.alert('Error', 'Faltan parámetros: ID de materia o del maestro');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('asistencias')
          .select(`
            fecha,
            escaneo_inicio,
            escaneo_fin,
            asistencia,
            horarios!inner (
              dia_semana,
              hora_inicio,
              materia_usuario!inner (
                materias!inner (
                  id,
                  nombre
                )
              )
            )
          `)
          .eq('id_usuario', user_Id)
          .eq('horarios.materia_usuario.materias.id', idMateria);

        if (error) {
          console.error('Error al obtener asistencias:', error.message);
          Alert.alert('Error', 'No se pudieron obtener las asistencias');
          return;
        }

        setAsistencias(data || []);
      } catch (err) {
        console.error('Error inesperado:', err);
        Alert.alert('Error', 'Algo salió mal al cargar asistencias');
      } finally {
        setLoading(false);
      }
    };

    fetchAsistencias();
  }, [id_materia, userId]);

  return (
    <SafeAreaView className="h-full">
      <ImageBackground
        source={require('@/assets/images/fondo.png')} 
        resizeMode="cover"
        className="flex-1"
        
      >
        <View className="bg-white/90 flex-1 px-4 pb-4">
          {/* Encabezado */}
          <View className="flex-row justify-center items-center mt-4 mb-2">
            <Text className="text-3xl font-bold text-red-800 mr-2">Asistencias</Text>
            <Image source={require('@/assets/images/logo_carga.png')} className="w-8 h-8" />
          </View>

          {/* Tabla encabezado */}
          <View className="flex-row justify-between bg-red-800 rounded-lg px-3 py-2 mb-2">
            <Text className="text-white font-bold w-[22%] text-center">FECHA</Text>
            <Text className="text-white font-bold w-[22%] text-center">ENTRADA</Text>
            <Text className="text-white font-bold w-[22%] text-center">SALIDA</Text>
            <Text className="text-white font-bold w-[22%] text-center">ASIST.</Text>
          </View>

          {/* Lista de asistencias */}
          <ScrollView className="space-y-2">
            {loading ? (
              <View className="items-center mt-10">
                <ActivityIndicator size="large" color="#DC2626" />
                <Text className="text-gray-500 mt-2">Cargando asistencias...</Text>
              </View>
            ) : asistencias.length === 0 ? (
              <Text className="text-center text-gray-500">No hay asistencias registradas</Text>
            ) : (
              asistencias.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between bg-white/90 rounded-lg px-3 py-2 border border-gray-200"
                >
                  <Text className="w-[22%] text-center font-medium text-black">{item.fecha}</Text>
                  <Text className="w-[22%] text-center text-black">{item.escaneo_inicio || '---'}</Text>
                  <Text className="w-[22%] text-center text-black">{item.escaneo_fin || '---'}</Text>
                  <Text className="w-[22%] text-center text-xl">
                    {item.asistencia ? '✅' : '❌'}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Botón de regreso */}
          <View className="items-end mt-4">
            <TouchableOpacity
              className="bg-red-700 p-3 rounded-full"
              onPress={() => router.back()}
              accessible
              accessibilityLabel="Volver atrás"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
