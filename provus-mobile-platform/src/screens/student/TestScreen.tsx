import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { StudentStackParamList } from '../../types/StudentTypes';
import { mockAvaliacao } from '../../mock';

type Props = NativeStackScreenProps<StudentStackParamList, 'Test'>;

const TestScreen: React.FC<Props> = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

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
        <TouchableOpacity
          onPress={() => setInfoModalVisible(true)}
          style={styles.menuButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Icon name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenterContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mockAvaliacao.titulo}
          </Text>
          <Text style={styles.headerSubtitle}>Prof. Johnson</Text>
        </View>
        <View style={styles.timerContainer}>
          <Icon name="clock" size={16} color={COLORS.white} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}></ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Enviar avaliação</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isInfoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInfoModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
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
          </Pressable>
        </Pressable>
      </Modal>
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
  menuButton: {
    padding: 4,
  },
  headerCenterContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContainer: {
    padding: 16,
  },
  ModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  ModalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    width: '80%',
    height: '100%',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 16,
  },
  infoText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
});

export default TestScreen;
