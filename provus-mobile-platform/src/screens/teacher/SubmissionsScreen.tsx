import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { SubmissoesResponse, Submissao } from '../../types/Submission';
import submissionsApiService from '../../services/submissionsApiService';
import { COLORS } from '../../constants/colors';

type SubmissionsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Submissions'
>;

const SubmissionCard = ({
  submission,
  pontuacaoTotalAvaliacao
}: {
  submission: Submissao;
  pontuacaoTotalAvaliacao: number;
}) => {
  const statusColor = submissionsApiService.getEstadoColor(submission.estado);
  const statusBackgroundColor = submissionsApiService.getEstadoBackgroundColor(submission.estado);
  const percentage = submission.pontuacaoTotal !== null && pontuacaoTotalAvaliacao > 0
    ? ((submission.pontuacaoTotal / pontuacaoTotalAvaliacao) * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {submission.estudante.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{submission.estudante.nome}</Text>
            <Text style={styles.studentEmail}>{submission.estudante.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {submission.estado}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="hash" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>Código:</Text>
          <Text style={styles.infoValue}>{submission.codigoEntrega}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="clock" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>Iniciado:</Text>
          <Text style={styles.infoValue}>
            {submissionsApiService.formatDateTime(submission.iniciadoEm)}
          </Text>
        </View>

        {submission.finalizadoEm && (
          <View style={styles.infoRow}>
            <Icon name="check-circle" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Finalizado:</Text>
            <Text style={styles.infoValue}>
              {submissionsApiService.formatDateTime(submission.finalizadoEm)}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="award" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>Pontuação:</Text>
          <Text style={[
            styles.infoValue,
            { color: parseFloat(percentage) >= 70 ? '#27AE60' : '#E74C3C', fontWeight: 'bold' }
          ]}>
            {submission.pontuacaoTotal !== null ? `${submission.pontuacaoTotal} pts (${percentage}%)` : '-'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SubmissionsScreen = ({ navigation, route }: SubmissionsScreenProps) => {
  const [data, setData] = useState<SubmissoesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const applicationId = route.params.applicationId;

  useEffect(() => {
    loadSubmissions();
  }, [applicationId]);

  const loadSubmissions = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await submissionsApiService.getSubmissionsByApplication(applicationId);
      setData(response);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        'Erro ao carregar submissões. Tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadSubmissions(true);
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
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Carregando submissões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#E74C3C" />
          <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSubmissions}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent
        />
        <View style={styles.errorContainer}>
          <Icon name="inbox" size={48} color={COLORS.textSecondary} />
          <Text style={styles.errorTitle}>Nenhum dado encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <Icon name="bell" size={22} color={COLORS.textSecondary} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>Resultados da Aplicação</Text>
        <Text style={styles.pageSubtitle}>{data.titulo}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.submissoes.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {data.submissoes.filter(s => ['Enviada', 'Avaliada', 'Encerrada'].includes(s.estado)).length}
            </Text>
            <Text style={styles.statLabel}>Finalizadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {data.submissoes.filter(s => ['Iniciada', 'Pausada', 'Reaberta'].includes(s.estado)).length}
            </Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Submissões dos Alunos</Text>

        {data.submissoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>Nenhuma submissão encontrada</Text>
            <Text style={styles.emptyStateText}>
              Ainda não há submissões para esta aplicação.
            </Text>
          </View>
        ) : (
          data.submissoes.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              pontuacaoTotalAvaliacao={data.pontuacaoTotal}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  pageSubtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  studentEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  cardBody: { gap: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
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
  retryButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SubmissionsScreen;