import { Link, Stack } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import AppFooter from '@/components/ui/AppFooter';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>This screen does not exist.</Text>

          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>Go to Focus</Text>
          </Link>
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.footerWrap}>
            <AppFooter />
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#70b1ff',
  },
  footerWrap: {
    width: '100%',
    marginTop: 12,
  },
});


