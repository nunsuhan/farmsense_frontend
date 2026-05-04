import React, { useState } from 'react';
import { Pressable, Text, Modal, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

export const FarmSwitcher: React.FC = () => {
  const farmList = useStore((s) => s.farmList);
  const currentFarmId = useStore((s) => s.currentFarmId);
  const setCurrentFarmId = useStore((s) => s.setCurrentFarmId);
  const [modalVisible, setModalVisible] = useState(false);

  // 0~1개: 토글 UI 숨김 (단일 농장은 농장명만 표시할지 결정 — 일단 숨김)
  if (farmList.length <= 1) {
    if (farmList.length === 1) {
      return <Text style={styles.singleName} numberOfLines={1}>{farmList[0].name}</Text>;
    }
    return null;
  }

  const currentFarm = farmList.find((f) => f.id === currentFarmId);
  const currentName = currentFarm?.name ?? '농장 선택';

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} style={styles.trigger}>
        <Text style={styles.triggerText} numberOfLines={1}>{currentName}</Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>농장 선택</Text>
            <FlatList
              data={farmList}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isActive = item.id === currentFarmId;
                return (
                  <TouchableOpacity
                    style={[styles.item, isActive && styles.itemActive]}
                    onPress={() => {
                      setCurrentFarmId(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.itemName, isActive && styles.itemNameActive]}>
                      {item.name}
                    </Text>
                    {item.address ? (
                      <Text style={styles.itemAddress} numberOfLines={1}>{item.address}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', maxWidth: 220 },
  triggerText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  arrow: { fontSize: 10, marginLeft: 4, color: '#1f2937' },
  singleName: { fontSize: 16, fontWeight: '600', color: '#1f2937', maxWidth: 220 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox: {
    position: 'absolute', top: 80, left: 16, right: 16,
    backgroundColor: 'white', borderRadius: 12, padding: 12, maxHeight: 400,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, paddingHorizontal: 8 },
  item: { padding: 12, borderRadius: 8, marginVertical: 2 },
  itemActive: { backgroundColor: '#e8f5e9' },
  itemName: { fontSize: 16, fontWeight: '400', color: '#333' },
  itemNameActive: { fontWeight: '600', color: '#2e7d32' },
  itemAddress: { fontSize: 12, color: '#666', marginTop: 2 },
});

export default FarmSwitcher;
