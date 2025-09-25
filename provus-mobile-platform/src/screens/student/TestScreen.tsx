import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { StudentStackParamList } from '../../types/StudentTypes';
import { mockAvaliacao } from '../../mock';

type Props = NativeStackScreenProps<StudentStackParamList, 'Test'>;

const TestScreen: React.FC<Props> = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  useEffect(() => {
    if (timeLeft === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{mockAvaliacao.titulo}</Text>
          <Text style={styles.headerSubtitle}>Prof. Johnson</Text>
        </View>
        <View style={styles.timerContainer}>
          <Icon name="clock" size={16} color={COLORS.white} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Test Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prof:</Text>
            <Text style={styles.infoText}>Prof.Johnson</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duração:</Text>
            <Text style={styles.infoText}>60 minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pontuação total:</Text>
            <Text style={styles.infoText}>
              {mockAvaliacao.pontuacao} pontos
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Questões:</Text>
            <Text style={styles.infoText}>
              {mockAvaliacao.questoes?.length} questões
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  scrollContainer: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: COLORS.textSecondary,
  },
  infoText: {
    color: COLORS.textPrimary,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
});

export default TestScreen;
