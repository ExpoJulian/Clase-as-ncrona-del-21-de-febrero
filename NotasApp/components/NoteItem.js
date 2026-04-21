import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';

const COLORS = {
  bg: '#0F0F14',
  card: '#1A1A24',
  cardBorder: '#2A2A3A',
  accent: '#7C6AF7',
  accentSoft: '#2E2A4A',
  gold: '#F5C842',
  goldSoft: '#3A3010',
  text: '#E8E8F0',
  textMuted: '#7A7A9A',
  danger: '#E05C6A',
  dangerSoft: '#3A1520',
};

export default function NoteItem({ note, onDelete, onToggleImportant }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar nota',
      `¿Eliminar "${note.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Animated.timing(deleteAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start(() => onDelete(note.id));
          },
        },
      ]
    );
  };

  const dateStr = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: deleteAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, deleteAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          note.isImportant && styles.cardImportant,
        ]}
      >
        {/* Borde izquierdo de acento */}
        <View
          style={[
            styles.accentBar,
            note.isImportant ? styles.accentBarGold : styles.accentBarPurple,
          ]}
        />

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
            {note.isImportant && (
              <View style={styles.importantBadge}>
                <Text style={styles.importantBadgeText}>★ IMPORTANTE</Text>
              </View>
            )}
          </View>

          {!!note.content && (
            <Text style={styles.content} numberOfLines={2}>
              {note.content}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.date}>{dateStr}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  note.isImportant ? styles.actionBtnGold : styles.actionBtnDefault,
                ]}
                onPress={() => onToggleImportant(note.id, note.isImportant)}
              >
                <Text style={styles.actionBtnText}>
                  {note.isImportant ? '★' : '☆'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={handleDelete}
              >
                <Text style={styles.actionBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardImportant: {
    borderColor: '#4A4010',
    backgroundColor: '#1C1B0F',
  },
  accentBar: {
    width: 4,
    borderRadius: 0,
  },
  accentBarPurple: {
    backgroundColor: COLORS.accent,
  },
  accentBarGold: {
    backgroundColor: COLORS.gold,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  importantBadge: {
    backgroundColor: COLORS.goldSoft,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  importantBadgeText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  content: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDefault: {
    backgroundColor: COLORS.accentSoft,
  },
  actionBtnGold: {
    backgroundColor: COLORS.goldSoft,
  },
  actionBtnDanger: {
    backgroundColor: COLORS.dangerSoft,
  },
  actionBtnText: {
    fontSize: 13,
    color: COLORS.text,
  },
});
