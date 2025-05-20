import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AsistenciasScreen() {
  const { id_materia, userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [asistencias, setAsistencias] = useState<any[]>([]);

  let user_Id = Number(userId);
  let idMateria = Number(id_materia);

  console.log("el usuario es " +user_Id);
  console.log("la materia es " +idMateria);

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
            id_horario,
            horarios (
              id,
              dia_semana,
              hora_inicio,
              id_materia_usuario,
              materia_usuario (
                id,
                id_materia,
                materias (
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
        
        console.log(JSON.stringify(data, null, 2));
        console.log('📦 Resultado completo:', JSON.stringify(data, null, 2));

        
        
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
              <Text className="mt-2 text-sm text-gray-600">
                Día: {asistencia.horarios?.dia_semana} | Hora: {asistencia.horarios?.hora_inicio}
              </Text>
              <Text className="text-sm text-gray-600">
                Materia: {asistencia.horarios?.materia_usuario?.materias?.nombre}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
