import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const COLORS = {
  background: '#F8F9FA',
  white: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  primary: '#192A56',
  green: '#E6F4EA',
  greenText: '#1E8449',
  red: '#FADBD8',
  redText: '#C0392B',
  border: '#E9ECEF',
};

const StatCard = ({
  title,
  value,
  valueColor,
}: {
  title: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statCardTitle}>{title}</Text>
    <Text
      style={[
        styles.statCardValue,
        { color: valueColor || COLORS.textPrimary },
      ]}
    >
      {value}
    </Text>
  </View>
);

type DashboardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Dashboard'
>;

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <Icon name="bell" size={22} color={COLORS.textSecondary} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>
        </View>

        <Text style={styles.breadcrumbs}>
          Aplicações &gt; Avaliação de História
        </Text>

        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Icon name="file-text" size={24} color={COLORS.primary} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.mainTitle}>
                Avaliação de História do Brasil
              </Text>
              <Text style={styles.subtitle}>
                Uma avaliação sobre o período colonial e o império no Brasil.
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>09/08/2025 19:12</Text>
        </View>

        <View style={styles.statusBanner}>
          <Icon name="check-circle" size={16} color={COLORS.greenText} />
          <Text style={styles.statusText}>Em Andamento • 3 participantes</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Total de Participantes" value="3" />
          <StatCard title="Média Geral" value="38.3%" valueColor="#D35400" />
          <StatCard
            title="Taxa de conclusão"
            value="66.7%"
            valueColor="#27AE60"
          />
          <StatCard title="Tempo médio de submissão" value="20m" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estatísticas de Notas</Text>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Maior Nota</Text>
            <Text style={styles.noteStatValue}>
              <Text style={{ color: COLORS.greenText, fontWeight: 'bold' }}>
                19
              </Text>{' '}
              / 20
            </Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Menor Nota</Text>
            <Text style={styles.noteStatValue}>
              <Text style={{ color: COLORS.redText, fontWeight: 'bold' }}>
                0
              </Text>{' '}
              / 20
            </Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Nota Média</Text>
            <Text style={styles.noteStatValue}>7.6</Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Desvio padrão</Text>
            <Text style={styles.noteStatValue}>8.2</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Penalidades e Violações</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { flex: 2 }]}>Estudante</Text>
            <Text style={[styles.tableHeader, { flex: 3 }]}>Email</Text>
            <Text style={[styles.tableHeader, { flex: 2 }]}>Infração</Text>
            <Text style={[styles.tableHeader, { flex: 1.5 }]}>Hora</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Fulano de tal</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>
              fulano@gmail.com
            </Text>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <View style={styles.tagRed}>
                <Text style={styles.tagText}>Copiar e Colar</Text>
              </View>
            </View>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>07:30:00</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatarText: { color: COLORS.white, fontWeight: 'bold' },
  breadcrumbs: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  titleTextContainer: { marginLeft: 12, flex: 1 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: { marginLeft: 8, color: COLORS.greenText, fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statCardTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  statCardValue: { fontSize: 24, fontWeight: 'bold' },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  noteStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  noteStatLabel: { fontSize: 14, color: COLORS.textSecondary },
  noteStatValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  tableCell: { color: COLORS.textPrimary, fontSize: 12 },
  tagRed: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: { color: COLORS.redText, fontSize: 10, fontWeight: 'bold' },
});

export default DashboardScreen;
