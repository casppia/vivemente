import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComparisonDrill } from '../../components/ComparisonDrill';

export default function ComparisonScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      { flex: 1, paddingTop: insets.top },
    ]}>
      <ComparisonDrill />
    </View>
  );
}