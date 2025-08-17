import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Aplicacao, Penalidade } from '../types/Application';
import mockDataService from '../services/mockDataService';
import TipoInfracaoEnum from '../enums/TipoInfracaoEnum';

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

const DashboardScreen = ({ navigation, route }: DashboardScreenProps) => {
  const [application, setApplication] = useState<Aplicacao | null>(null);
  const [loading, setLoading] = useState(true);
  const applicationId = route.params?.applicationId || 1;

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const data = await mockDataService.getApplicationById(applicationId);
        setApplication(data);
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  const getInfracaoLabel = (infracao: TipoInfracaoEnum): string => {
    return infracao || 'Infração';
  };

  const getStatusIcon = (estado: string): string => {
    switch (estado) {
      case 'Em Andamento':
        return 'clock';
      case 'Finalizada':
        return 'check-circle';
      case 'Agendada':
        return 'calendar';
      default:
        return 'file-text';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.textSecondary} />
          <Text style={styles.errorTitle}>Aplicação não encontrada</Text>
          <Text style={styles.errorText}>
            Não foi possível carregar os detalhes da aplicação.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = mockDataService.getStatusColor(application.estado);
  const statusIcon = getStatusIcon(application.estado);
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
          Aplicações &gt; {application.titulo}
        </Text>

        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Icon name="file-text" size={24} color={COLORS.primary} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.mainTitle} numberOfLines={2}>
                {application.titulo}
              </Text>
              {application.descricao && (
                <Text style={styles.subtitle} numberOfLines={3}>
                  {application.descricao}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.dateText}>
            {mockDataService.formatDateTime(application.dataAplicacao)}
          </Text>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: mockDataService.getStatusBackgroundColor(application.estado) }]}>
          <Icon name={statusIcon} size={16} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {application.estado} • {application.participantes} participantes
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            title="Total de Participantes" 
            value={application.participantes.toString()} 
          />
          <StatCard 
            title="Média Geral" 
            value={`${application.mediaGeral.toFixed(1)}%`} 
            valueColor={application.mediaGeral >= 70 ? '#27AE60' : '#D35400'}
          />
          <StatCard
            title="Taxa de conclusão"
            value={`${application.taxaDeConclusao.toFixed(1)}%`}
            valueColor={application.taxaDeConclusao >= 70 ? '#27AE60' : '#D35400'}
          />
          <StatCard 
            title="Tempo médio de submissão" 
            value={`${application.tempoMedio}m`} 
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estatísticas de Notas</Text>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Maior Nota</Text>
            <Text style={styles.noteStatValue}>
              <Text style={{ color: COLORS.greenText, fontWeight: 'bold' }}>
                {application.maiorNota}
              </Text>{' '}
              / {Math.round(application.maiorNota * 1.05) || 20}
            </Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Menor Nota</Text>
            <Text style={styles.noteStatValue}>
              <Text style={{ color: COLORS.redText, fontWeight: 'bold' }}>
                {application.menorNota}
              </Text>{' '}
              / {Math.round(application.maiorNota * 1.05) || 20}
            </Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Nota Média</Text>
            <Text style={styles.noteStatValue}>{application.notaMedia.toFixed(1)}</Text>
          </View>
          <View style={styles.noteStatRow}>
            <Text style={styles.noteStatLabel}>Desvio padrão</Text>
            <Text style={styles.noteStatValue}>{application.desvioPadrao.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Penalidades e Violações</Text>
          {application.penalidades.length === 0 ? (
            <View style={styles.emptyViolations}>
              <Icon name="check-circle" size={32} color={COLORS.greenText} />
              <Text style={styles.emptyViolationsText}>
                Nenhuma penalidade registrada
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Estudante</Text>
                <Text style={[styles.tableHeader, { flex: 3 }]}>Email</Text>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Infração</Text>
                <Text style={[styles.tableHeader, { flex: 1.5 }]}>Hora</Text>
              </View>
              {application.penalidades.map((penalidade: Penalidade, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>
                    {penalidade.estudante}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={2}>
                    {penalidade.email}
                  </Text>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <View style={styles.tagRed}>
                      <Text style={styles.tagText}>
                        {getInfracaoLabel(penalidade.infracao)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {mockDataService.formatTime(penalidade.hora)}
                  </Text>
                </View>
              ))}
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyViolations: {
    alignItems: 'center',
    padding: 24,
  },
  emptyViolationsText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
