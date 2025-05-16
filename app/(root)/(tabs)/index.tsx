import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useGlobalContext } from '@/lib/global-provider';

type MateriaAsignada = {
  id: number;
  materias: {
    nombre: string;
  } | null;
};

export default function AssignedSubjects() {
  const { user } = useGlobalContext();

  const [subjects, setSubjects] = useState<{ id: number; nombre: string }[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      if (!user?.email) {
        setLoading(false);
        Alert.alert('Error', 'No hay usuario autenticado');
        return;
      }

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

        setTeacherId(usuario.id);
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

        const nombresMaterias = (materiasAsignadas as unknown as MateriaAsignada[])
          .filter((item) => item.materias?.nombre)
          .map((item) => ({
            id: item.id,
            nombre: item.materias!.nombre,
          }));

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

        <View className="items-center mt-6">
          <Text className="text-3xl font-bold text-red-800">Materias</Text>
          <Text className="text-xl font-semibold text-red-800 -mt-2">Asignadas</Text>
        </View>

        <View className="items-center mt-4">
          <Text className="bg-red-700 text-white px-4 py-2 rounded-full font-semibold">
            {teacherName}
          </Text>
        </View>

        <View className="mt-6 gap-4">
          {loading ? (
            <View className="items-center mt-10">
              <ActivityIndicator size="large" color="#DC2626" />
              <Text className="text-center text-gray-500 mt-2">Cargando materias...</Text>
            </View>
          ) : subjects.length === 0 ? (
            <Text className="text-center text-gray-500">No hay materias asignadas</Text>
          ) : (
            subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                onPress={() =>
                  router.push({
                    pathname: "/asistencias",
                    params: {
                      id_materia: subject.id.toString(),
                      userId: teacherId?.toString() || ''
                    },
                  })
                }
                accessible
                accessibilityLabel={`Ver asistencia de ${subject.nombre}`}
              >
                <View className="bg-white/80 px-4 py-3 rounded-xl shadow border border-gray-200">
                  <Text className="text-lg font-semibold text-black text-center">
                    {subject.nombre}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}



