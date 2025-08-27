import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { StudentStackParamList } from '../../types/StudentTypes';

// --- Tipos ---
type Props = NativeStackScreenProps<StudentStackParamList, 'Test'>;

const TestScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      {/* Cabeçalho Fixo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mathematics Quiz</Text>
          <Text style={styles.headerSubtitle}>Prof. Johnson</Text>
        </View>
        <View style={styles.timerContainer}>
          <Icon name="clock" size={16} color={COLORS.white} />
          <Text style={styles.timerText}>00:58:43</Text>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* O conteúdo da prova (questões) virá aqui depois */}
      <View style={styles.contentArea}>
        <Text>Área para as questões...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary, // O azul escuro
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Sombra para Android
    elevation: 5,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.border,
    fontSize: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: COLORS.white,
    marginHorizontal: 8,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
});

export default TestScreen;
