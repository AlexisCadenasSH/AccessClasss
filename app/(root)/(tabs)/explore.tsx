// Importaciones
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, StyleSheet, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useGlobalContext } from '@/lib/global-provider';

const Explore = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const { user } = useGlobalContext();
  const codigoValido = 'cetis91';

  useEffect(() => {
    const fetchUserId = async () => {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', user.email)
        .single();

      if (error || !data) {
        console.error('Error al obtener el id del usuario:', error);
        return;
      }

      setIdUsuario(data.id);
    };

    fetchUserId();
  }, [user]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para acceder a la cámara</Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const registrarAsistencia = async () => {
    if (!idUsuario) return Alert.alert('❌ Error', 'No se pudo obtener el ID del usuario.');

    const fecha = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dia = diasSemana[fecha.getDay()];
    const hoy = fecha.toISOString().split('T')[0];

    const getMinutes = (t: string) => {
      const [h, m, s] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const horaActualMin = fecha.getHours() * 60 + fecha.getMinutes();

    const { data: horarios, error } = await supabase
      .from('horarios')
      .select('id, hora_inicio, hora_fin, id_materia_usuario (id_maestro, materia: id_materia (nombre))')
      .eq('dia_semana', dia);

    if (error || !horarios || horarios.length === 0) {
      return Alert.alert('❌ Error', 'No tienes clases hoy.');
    }

    const horariosDisponibles = horarios.filter(h => {
      const inicioMin = getMinutes(h.hora_inicio);
      return (
        h.id_materia_usuario?.id_maestro === idUsuario &&
        horaActualMin >= inicioMin - 10 &&
        horaActualMin <= inicioMin + 10
      );
    });

    if (horariosDisponibles.length === 0) {
      return Alert.alert('⏱ Fuera de tiempo', 'No tienes clases dentro del rango permitido de tiempo.');
    }

    const horario = horariosDisponibles[0];
    const nombreMateria = horario.id_materia_usuario?.materia?.nombre || 'Materia desconocida';
    const horaInicioMin = getMinutes(horario.hora_inicio);
    const horaFinMin = getMinutes(horario.hora_fin);

    const { data: asistenciaExistente } = await supabase
      .from('asistencias')
      .select('*')
      .eq('id_usuario', idUsuario)
      .eq('id_horario', horario.id)
      .eq('fecha', hoy)
      .maybeSingle();

    const horaActualStr = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;

    if (asistenciaExistente) {
      if (asistenciaExistente.escaneo_fin) {
        return Alert.alert('✅ Ya registraste salida', 'Ya registraste asistencia completa para esta materia.');
      }

      if (horaActualMin >= horaInicioMin && horaActualMin <= horaFinMin) {
        return Alert.alert(
          '¿Registrar salida?',
          `Ya registraste entrada. ¿Deseas registrar tu salida para ${nombreMateria}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Registrar salida',
              onPress: async () => {
                const { error: errorUpdate } = await supabase
                  .from('asistencias')
                  .update({ escaneo_fin: horaActualStr })
                  .eq('id', asistenciaExistente.id);

                if (errorUpdate) {
                  Alert.alert('❌ Error', 'No se pudo registrar la salida.');
                } else {
                  Alert.alert('✅ Salida registrada', 'Se registró la salida correctamente.');
                }
              }
            }
          ]
        );
      } else {
        return Alert.alert('⏱ Fuera de horario', 'Solo puedes registrar salida durante el horario de clase.');
      }
    } else {
      return Alert.alert(
        'Registrar entrada',
        `¿Deseas registrar tu entrada para ${nombreMateria}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Registrar entrada',
            onPress: async () => {
              const { error: errorInsert } = await supabase
                .from('asistencias')
                .insert([{
                  id_usuario: idUsuario,
                  id_horario: horario.id,
                  fecha: hoy,
                  escaneo_inicio: horaActualStr,
                  asistencia: true
                }]);

              if (errorInsert) {
                Alert.alert('❌ Error', 'No se pudo registrar la entrada.');
              } else {
                Alert.alert('✅ Entrada registrada', 'Se registró tu entrada correctamente.');
              }
            }
          }
        ]
      );
    }
  };

  function handleBarcodeScanned({ data }: { data: string }) {
    if (!scanned) {
      setScanned(true);
      if (data === codigoValido) {
        registrarAsistencia();
      } else {
        Alert.alert('❌ Código inválido', 'Por favor escanea un código válido.');
      }
      setTimeout(() => setScanned(false), 3000);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' && <StatusBar hidden />}
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlayTop}>
          <Text style={styles.qrText}>Escanea un código QR...</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>🔄</Text>
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: 'center', fontSize: 16, color: 'black' },
  camera: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  text: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  overlayTop: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrText: { color: 'white', fontSize: 18 },
});
