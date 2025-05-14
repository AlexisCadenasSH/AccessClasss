import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, StyleSheet, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase'; // Cliente de Supabase ya configurado

const Explore = () => {
  // Estado para cambiar entre cámara frontal y trasera
  const [facing, setFacing] = useState<CameraType>('back');

  // Solicitud de permisos para usar la cámara
  const [permission, requestPermission] = useCameraPermissions();

  // Estado que evita múltiples lecturas seguidas
  const [scanned, setScanned] = useState(false);
  

  // Código QR válido esperado
  const codigoValido = 'cetis91';

  // Si aún no se ha verificado el permiso, no se muestra nada
  if (!permission) return <View />;

  // Si el permiso no ha sido concedido, se solicita
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para acceder a la cámara</Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  // Cambiar entre cámara frontal y trasera
  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // ✅ Mejora: registro en la base de datos con manejo de error detallado
  const registrarEntrada = async () => {
    const now = new Date();

    // Formatos ISO para compatibilidad con bases de datos
    const fecha = now.toISOString().split('T')[0]; // yyyy-mm-dd
    const entrada = now.toTimeString().split(' ')[0]; // hh:mm:ss

    const { data, error } = await supabase
      .from('horarios') // Nombre de la tabla en Supabase
      .insert([{ fecha: fecha, entrada: entrada }]);

    if (error) {
      console.error('Error al registrar la entrada:', error.message, error.details);
      Alert.alert('❌ Error', 'No se pudo registrar la entrada.');
    } else {
      console.log('Entrada registrada exitosamente:', data);
    }
  };

  // ✅ Mejora: evita mostrar el valor escaneado y permite escanear nuevamente después de 3 segundos
  function handleBarcodeScanned({ data }: { data: string }) {
    if (!scanned) {
      setScanned(true); // Bloquea múltiples escaneos

      if (data === codigoValido) {
        Alert.alert('✅ Registro exitoso', 'El código escaneado es válido.');
        registrarEntrada();
      } else {
        Alert.alert('❌ Código no válido', 'Por favor, escanea un código válido.');
      }

      // Permite volver a escanear después de 3 segundos
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Mejora: Oculta la barra de estado en Android para vista completa */}
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}

      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* ✅ Mejora: Mensaje fijo informativo, ubicado más arriba y sin mostrar datos del QR */}
        <View style={styles.overlayTop}>
          <Text style={styles.qrText}>Escanea un código QR...</Text>
        </View>

        {/* Botón para cambiar entre cámara frontal y trasera */}
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>🔄</Text>
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    color: 'black',
  },
  camera: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Botón semitransparente
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  // ✅ Mejora: Mensaje fijo en la parte superior
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
  qrText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
