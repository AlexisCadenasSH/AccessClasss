import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, router } from 'expo-router'; // Importa router
import { supabase } from '@/utils/supabase';
import { useGlobalContext } from '@/lib/global-provider';

export default function AssignedSubjects() {
  const { user } = useGlobalContext();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      if (!user?.email) return;

      try {
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('correo', user.email)
          .single();

        if (usuarioError || !usuario) {
          console.error('Error al obtener usuario:', usuarioError?.message);
          Alert.alert('Error', 'No se pudo obtener la información del usuario');
          return;
        }

        setTeacherName(usuario.nombre || 'Nombre no disponible');

        const { data: materiasAsignadas, error: materiasError } = await supabase
          .from('materia_usuario')
          .select(`
            id,
            id_maestro,
            materias (nombre)
          `)
          .eq('id_maestro', usuario.id);

        if (materiasError) {
          console.error('Error al cargar materias:', materiasError.message);
          Alert.alert('Error', 'No se pudieron cargar las materias asignadas');
          return;
        }

        const nombresMaterias = materiasAsignadas
          .map((item: any) => item.materias?.nombre)
          .filter(Boolean);

        setSubjects(nombresMaterias);
      } catch (err) {
        console.error('Error inesperado:', err);
        Alert.alert('Error', 'Algo salió mal al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedSubjects();
  }, [user]);

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 px-6">

        {/* Header */}
        <View className="items-center mt-6">
          <Text className="text-3xl font-bold text-red-800">Materias</Text>
          <Text className="text-xl font-semibold text-red-800 -mt-2">Asignadas</Text>
        </View>

        {/* Nombre del maestro */}
        <View className="items-center mt-4">
          <Text className="bg-red-700 text-white px-4 py-2 rounded-full font-semibold">
            {teacherName}
          </Text>
        </View>

        {/* Lista de materias */}
        <View className="mt-6 gap-4">
          {loading ? (
            <Text className="text-center text-gray-500">Cargando materias...</Text>
          ) : subjects.length === 0 ? (
            <Text className="text-center text-gray-500">No hay materias asignadas</Text>
          ) : (
            subjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push({ pathname: '/asistencias', params: { materia: subject } })}
              >
                <View className="bg-white/80 px-4 py-3 rounded-xl shadow border border-gray-200">
                  <Text className="text-lg font-semibold text-black text-center">{subject}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Botón de regreso */}
        <View className="items-center mt-6">
          <Link href="/" className="text-red-600 underline text-base">Volver al inicio</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

