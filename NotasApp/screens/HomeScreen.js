import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import {
  getAllNotes,
  searchNotes,
  addNote,
  deleteNote,
  toggleImportant,
  getPreferences,
} from '../db/database';
import NoteItem from '../components/NoteItem';

const COLORS = {
  bg: '#0F0F14',
  card: '#1A1A24',
  cardBorder: '#2A2A3A',
  accent: '#7C6AF7',
  accentSoft: '#2E2A4A',
  text: '#E8E8F0',
  textMuted: '#7A7A9A',
  input: '#13131C',
  inputBorder: '#252535',
  gold: '#F5C842',
};

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefs, setPrefs] = useState({ showOnlyImportant: false, sortBy: 'date' });
  const [loading, setLoading] = useState(true);

  // Modal de nueva nota
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImportant, setNewImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Carga las notas cada vez que la pantalla recibe foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAll();
    });
    return unsubscribe;
  }, [navigation]);

  // Relanza la búsqueda cuando cambia el texto
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      loadAll();
    }
  }, [searchQuery, prefs]);

  // Anima el FAB al entrar
  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: 1,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const currentPrefs = await getPreferences();
      const updatedPrefs = {
        showOnlyImportant: !!currentPrefs?.showOnlyImportant,
        sortBy: currentPrefs?.sortBy || 'date',
      };
      setPrefs(updatedPrefs);
      const data = await getAllNotes(updatedPrefs.showOnlyImportant, updatedPrefs.sortBy);
      setNotes(data);
    } catch (e) {
      console.error('Error cargando notas:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (q) => {
    try {
      const data = await searchNotes(q, prefs.showOnlyImportant, prefs.sortBy);
      setNotes(data);
    } catch (e) {
      console.error('Error buscando:', e);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setNewTitle('');
      setNewContent('');
      setNewImportant(false);
    });
  };

  const handleAddNote = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await addNote(newTitle.trim(), newContent.trim(), newImportant ? 1 : 0);
      closeModal();
      await loadAll();
    } catch (e) {
      console.error('Error guardando nota:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleImportant = async (id, current) => {
    await toggleImportant(id, current);
    await loadAll();
  };

  // Filtro activo de pestañas
  const FilterTab = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.filterTab, active && styles.filterTabActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const showingImportant = prefs.showOnlyImportant;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Notas</Text>
          <Text style={styles.headerSub}>
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
            {showingImportant ? ' · solo importantes' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ── Buscador ── */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tabs de filtro ── */}
      <View style={styles.filterRow}>
        <FilterTab
          label="Todas"
          active={!showingImportant}
          onPress={async () => {
            const { updatePreferences } = require('../db/database');
            await updatePreferences(false, prefs.sortBy);
            await loadAll();
          }}
        />
        <FilterTab
          label="★ Importantes"
          active={showingImportant}
          onPress={async () => {
            const { updatePreferences } = require('../db/database');
            await updatePreferences(true, prefs.sortBy);
            await loadAll();
          }}
        />
      </View>

      {/* ── Lista ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Sin resultados' : 'Sin notas'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Intenta con otro término de búsqueda'
              : 'Presiona + para crear tu primera nota'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onDelete={handleDelete}
              onToggleImportant={handleToggleImportant}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── FAB ── */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              { scale: fabAnim },
              { rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.fabBtn} onPress={openModal}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Modal nueva nota ── */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Animated.View
            style={[
              styles.modalCard,
              {
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
                opacity: modalAnim,
              },
            ]}
          >
            <Text style={styles.modalTitle}>Nueva Nota</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título *"
              placeholderTextColor={COLORS.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              maxLength={80}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Contenido (opcional)"
              placeholderTextColor={COLORS.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.importantRow}>
              <Text style={styles.importantLabel}>Marcar como importante</Text>
              <Switch
                value={newImportant}
                onValueChange={setNewImportant}
                trackColor={{ false: COLORS.inputBorder, true: COLORS.accent }}
                thumbColor={newImportant ? '#fff' : COLORS.textMuted}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !newTitle.trim() && styles.saveBtnDisabled]}
                onPress={handleAddNote}
                disabled={!newTitle.trim() || saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18 },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: { fontSize: 15, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  clearBtn: { color: COLORS.textMuted, fontSize: 14, paddingHorizontal: 4 },

  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  filterTabActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  filterTabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.accent },

  // List
  list: { paddingBottom: 100 },

  // Empty / loading
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabBtn: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  modalInput: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 12,
  },
  modalTextArea: { height: 100 },
  importantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  importantLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
