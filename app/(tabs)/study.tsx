import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

export default function StudyScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      { backgroundColor: isDark ? '#000000' : '#ffffff' }
    ]}>
      <Text style={[
        styles.header,
        { color: isDark ? '#ffffff' : '#000000' }
      ]}>
        Study
      </Text>
      <View style={styles.content}>
        <Text style={[
          styles.message,
          { color: isDark ? '#888888' : '#666666' }
        ]}>
          Study features coming soon!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
  },
});