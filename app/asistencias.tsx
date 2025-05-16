import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AsistenciasScreen() {
  const { id_materia, userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [asistencias, setAsistencias] = useState<any[]>([]);

  useEffect(() => {
    const fetchAsistencias = async () => {
      if (!id_materia) {
        Alert.alert('Error', 'No se proporcionó el ID de la materia');
        setLoading(false);
        return;
      }

      try {
        // 1. Obtener los horarios vinculados a esta materia_usuario
        const { data: horariosRelacionados, error: errorHorarios } = await supabase
          .from('horarios')
          .select('id')
          .eq('id_materia_usuario', Number(id_materia));

        if (errorHorarios) {
          console.error('Error al obtener horarios:', errorHorarios.message);
          Alert.alert('Error', 'No se pudieron obtener los horarios relacionados');
          return;
        }

        const idsHorarios = horariosRelacionados?.map((h) => h.id) || [];

        if (idsHorarios.length === 0) {
          setAsistencias([]);
          return;
        }

        // 2. Obtener asistencias filtradas por esos horarios
        const { data: asistenciasData, error: errorAsistencias } = await supabase
          .from('asistencias')
          .select('*')
          .in('id_horario', idsHorarios);

        if (errorAsistencias) {
          console.error('Error al obtener asistencias:', errorAsistencias.message);
          Alert.alert('Error', 'No se pudieron obtener las asistencias');
          return;
        }

        setAsistencias(asistenciasData || []);
      } catch (err) {
        console.error('Error inesperado:', err);
        Alert.alert('Error', 'Algo salió mal al cargar asistencias');
      } finally {
        setLoading(false);
      }
    };

    fetchAsistencias();
  }, [id_materia]);

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-red-800 text-center mb-4">Registro de Asistencias</Text>

        {loading ? (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#DC2626" />
            <Text className="text-gray-500 mt-2">Cargando asistencias...</Text>
          </View>
        ) : asistencias.length === 0 ? (
          <Text className="text-center text-gray-500">No hay asistencias registradas</Text>
        ) : (
          asistencias.map((asistencia, index) => (
            <View key={index} className="mb-3 bg-gray-100 rounded-xl p-4 shadow">
              <Text className="text-black font-semibold">Fecha: {asistencia.fecha}</Text>
              <Text>Inicio: {asistencia.escaneo_inicio || 'N/A'}</Text>
              <Text>Fin: {asistencia.escaneo_fin || 'N/A'}</Text>
              <Text>Asistencia: {asistencia.asistencia ? '✅' : '❌'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



