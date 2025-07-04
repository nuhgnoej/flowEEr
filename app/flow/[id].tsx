// app/flow/[id].tsx
import { useNavigation, Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getFlowById } from '@/lib/flowRepository';
import { Flow } from '@/lib/types';

export default function FlowDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [flow, setFlow] = useState<Flow | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: '플로우' });
  }, []);
  
  useEffect(() => {
    if (id) {
      getFlowById(Number(id)).then(setFlow);
    }
  }, [id]);

  if (!flow) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{flow.name}</Text>
      <Text style={styles.desc}>{flow.description}</Text>
      <Link href={`/flow/${id}/run`} asChild>
        <Button title="플로우 시작" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  name: { fontSize: 20, fontWeight: '600' },
  desc: { marginVertical: 8, color: '#666' },
});