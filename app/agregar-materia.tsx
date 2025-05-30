import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AgregarMateria() {
  const { id: maestroId } = useLocalSearchParams();
  const [todasLasMaterias, setTodasLasMaterias] = useState<{ id: number; nombre: string }[]>([]);
  const [materiasAsignadasIds, setMateriasAsignadasIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);

      const { data: materias, error: errorMaterias } = await supabase
        .from('materias')
        .select('id, nombre');

      if (errorMaterias) {
        Alert.alert('Error', 'No se pudieron cargar las materias');
        return;
      }

      const { data: asignadas, error: errorAsignadas } = await supabase
        .from('materia_usuario')
        .select('id_materia')
        .eq('id_maestro', maestroId);

      if (errorAsignadas) {
        Alert.alert('Error', 'No se pudieron cargar las materias asignadas');
        return;
      }

      const asignadasIds = asignadas?.map((m) => m.id_materia) || [];

      setTodasLasMaterias(materias || []);
      setMateriasAsignadasIds(asignadasIds);
      setLoading(false);
    };

    if (maestroId) {
      cargarDatos();
    }
  }, [maestroId]);

  const agregarMateria = async (idMateria: number) => {
    const yaAsignada = materiasAsignadasIds.includes(idMateria);
    if (yaAsignada) {
      Alert.alert('Ya asignada', 'Esta materia ya está asignada al maestro.');
      return;
    }

    const { error } = await supabase.from('materia_usuario').insert({
      id_maestro: maestroId,
      id_materia: idMateria,
    });

    if (error) {
      Alert.alert('Error', 'No se pudo asignar la materia');
      return;
    }

    Alert.alert('Éxito', 'Materia asignada correctamente');
    router.back(); // Vuelve a la pantalla anterior
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-6 pt-8">
        <Text className="text-2xl font-bold text-red-800 text-center mb-6">Agregar Materia</Text>

        {loading ? (
          <Text className="text-center text-gray-500">Cargando...</Text>
        ) : todasLasMaterias.length === 0 ? (
          <Text className="text-center text-gray-500">No hay materias registradas</Text>
        ) : (
          todasLasMaterias.map((materia) => (
            <TouchableOpacity
              key={materia.id}
              className="bg-white py-3 px-4 mb-3 rounded-xl border border-gray-300 shadow"
              onPress={() => agregarMateria(materia.id)}
            >
              <Text className="text-center text-lg font-semibold text-black">
                {materia.nombre}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
