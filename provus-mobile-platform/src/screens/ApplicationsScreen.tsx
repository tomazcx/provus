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
  green: '#27AE60',
  yellow: '#F2C94C',
  border: '#E9ECEF',
};

const ApplicationCard = ({ navigation }: { navigation: any }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name="clock" size={24} color={COLORS.yellow} />
      <Text style={styles.cardTitle}>Mathematics Quiz - Chapter 1</Text>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Aplicado em:</Text>
        <Text style={styles.infoValue}>09 de agosto de 2025</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Alunos:</Text>
        <Text style={styles.infoValue}>3 participantes</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Média:</Text>
        <Text style={[styles.infoValue, { color: '#D35400' }]}>38.3%</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Status:</Text>
        <View style={styles.statusTag}>
          <Text style={styles.statusTagText}>Em Andamento</Text>
        </View>
      </View>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonTextPrimary}>Ver Detalhes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary}>
        <Text style={styles.buttonTextSecondary}>Resultados</Text>
      </TouchableOpacity>
    </View>
  </View>
);

type ApplicationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Applications'
>;

const ApplicationsScreen = ({ navigation }: ApplicationsScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Provus</Text>
          <View style={styles.headerIcons}>
            <Icon name="bell" size={22} color={COLORS.textSecondary} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>Aplicações de Avaliações</Text>
        <Text style={styles.pageSubtitle}>
          Visualize e gerencie as avaliações aplicadas e seus resultados.
        </Text>

        <ApplicationCard navigation={navigation} />
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
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
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 24,
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  cardBody: { paddingVertical: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: { color: COLORS.textSecondary, fontSize: 14 },
  infoValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  statusTag: {
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: { color: '#B7950B', fontWeight: 'bold', fontSize: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  buttonTextPrimary: { color: COLORS.white, fontWeight: 'bold' },
  buttonSecondary: {
    backgroundColor: COLORS.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonTextSecondary: { color: COLORS.white, fontWeight: 'bold' },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  configButtonText: {
    marginLeft: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ApplicationsScreen;
