/**
 * 농작업 체크리스트 컴포넌트
 * Week 6 Day 1
 * 
 * 핵심: 오늘 해야 할 농작업을 체크리스트로 표시
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FarmSenseColors, softShadow } from '../../theme/colors';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface ActionChecklistProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
}

const ActionChecklist: React.FC<ActionChecklistProps> = ({ 
  tasks, 
  onTaskToggle 
}) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleToggle = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    onTaskToggle?.(taskId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '📝';
      default:
        return '📝';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>✅ 오늘의 농작업</Text>
      
      <View style={[styles.card, softShadow]}>
        {tasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskRow,
              index !== tasks.length - 1 && styles.taskRowBorder,
            ]}
            onPress={() => handleToggle(task.id)}
          >
            {/* 체크박스 */}
            <View style={[
              styles.checkbox,
              completedTasks.has(task.id) && styles.checkboxChecked,
            ]}>
              {completedTasks.has(task.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            
            {/* 우선순위 아이콘 */}
            <Text style={styles.priorityIcon}>
              {getPriorityIcon(task.priority)}
            </Text>
            
            {/* 작업 내용 */}
            <Text style={[
              styles.taskTitle,
              completedTasks.has(task.id) && styles.taskTitleCompleted,
            ]}>
              {task.title}
            </Text>
          </TouchableOpacity>
        ))}
        
        {tasks.length === 0 && (
          <Text style={styles.emptyText}>오늘은 예정된 작업이 없습니다.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FarmSenseColors.text.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: FarmSenseColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FarmSenseColors.card.border,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: FarmSenseColors.card.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: FarmSenseColors.text.light,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: FarmSenseColors.success,
    borderColor: FarmSenseColors.success,
  },
  checkmark: {
    color: FarmSenseColors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: FarmSenseColors.text.primary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: FarmSenseColors.text.light,
  },
  emptyText: {
    fontSize: 14,
    color: FarmSenseColors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ActionChecklist;










