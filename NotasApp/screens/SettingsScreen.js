import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { getPreferences, updatePreferences } from '../db/database';

const COLORS = {
  bg: '#0F0F14',
  card: '#1A1A24',
  cardBorder: '#2A2A3A',
  accent: '#7C6AF7',
  accentSoft: '#2E2A4A',
  text: '#E8E8F0',
  textMuted: '#7A7A9A',
  gold: '#F5C842',
  goldSoft: '#3A3010',
  success: '#3ECF8E',
  successSoft: '#0D2E20',
};

export default function SettingsScreen({ navigation }) {
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) {
        setShowOnlyImportant(!!prefs.showOnlyImportant);
        setSortBy(prefs.sortBy || 'date');
      }
    } catch (e) {
      console.error('Error cargando preferencias:', e);
    }
  };

  const handleSave = async () => {
    try {
      await updatePreferences(showOnlyImportant, sortBy);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigation.goBack();
      }, 800);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar las preferencias.');
    }
  };

  const SortOption = ({ value, label, emoji }) => {
    const active = sortBy === value;
    return (
      <TouchableOpacity
        style={[styles.sortOption, active && styles.sortOptionActive]}
        onPress={() => setSortBy(value)}
      >
        <Text style={styles.sortOptionEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sortOptionLabel, active && styles.sortOptionLabelActive]}>
            {label}
          </Text>
        </View>
        <View style={[styles.radio, active && styles.radioActive]}>
          {active && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  const SettingRow = ({ label, description, value, onValueChange, color }) => (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {!!description && (
          <Text style={styles.settingDesc}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.cardBorder, true: color || COLORS.accent }}
        thumbColor={value ? '#fff' : COLORS.textMuted}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Sección: Filtros ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>Filtros</Text>
          </View>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Solo notas importantes"
              description="Oculta las notas normales en la pantalla principal"
              value={showOnlyImportant}
              onValueChange={setShowOnlyImportant}
              color={COLORS.gold}
            />
          </View>
        </View>

        {/* ── Sección: Ordenamiento ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Orden de las notas</Text>
          </View>
          <View style={styles.sectionCard}>
            <SortOption
              value="date"
              label="Por fecha (más recientes primero)"
              emoji="🕐"
            />
            <View style={styles.divider} />
            <SortOption
              value="alpha"
              label="Alfabético (A → Z)"
              emoji="🔤"
            />
          </View>
        </View>

        {/* ── Vista previa ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👁</Text>
            <Text style={styles.sectionTitle}>Vista previa del filtro</Text>
          </View>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewDot}>●</Text>
              <Text style={styles.previewText}>
                Mostrará:{' '}
                <Text style={styles.previewHighlight}>
                  {showOnlyImportant ? '★ Solo notas importantes' : 'Todas las notas'}
                </Text>
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewDot}>●</Text>
              <Text style={styles.previewText}>
                Ordenadas:{' '}
                <Text style={styles.previewHighlight}>
                  {sortBy === 'date' ? 'Por fecha (recientes primero)' : 'Alfabéticamente'}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── Versión / info ── */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>NotasApp · v1.0.0</Text>
          <Text style={styles.infoText}>SQLite con expo-sqlite</Text>
        </View>

      </ScrollView>

      {/* Botón guardar */}
      <View style={styles.saveWrapper}>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  // Sections
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },

  // Setting row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  // Sort options
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sortOptionActive: { backgroundColor: COLORS.accentSoft },
  sortOptionEmoji: { fontSize: 18 },
  sortOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  sortOptionLabelActive: { color: COLORS.accent, fontWeight: '700' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.accent },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 16,
  },

  // Preview
  previewCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '50',
    padding: 16,
    gap: 8,
  },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  previewDot: { color: COLORS.accent, fontSize: 10, marginTop: 4 },
  previewText: { color: COLORS.textMuted, fontSize: 13, flex: 1 },
  previewHighlight: { color: COLORS.accent, fontWeight: '700' },

  // Info
  infoBlock: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  infoText: { color: COLORS.textMuted, fontSize: 11, letterSpacing: 0.5 },

  // Save button
  saveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  saveBtnSuccess: { backgroundColor: COLORS.success },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
