import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import clsx from 'clsx';
import { showToast } from '@/lib/toast';

const EXAMS = ['JEE', 'NEET', 'UPSC', 'CAT', 'GMAT', 'Custom'];
const PRESETS = ['High Intensity', 'Balanced Daily', 'Weekend Heavy', 'Revision First'];

type BuildMode = 'preset' | 'custom' | null;

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [exam, setExam] = useState('');
  const [mode, setMode] = useState<BuildMode>(null);
  const [preset, setPreset] = useState(PRESETS[1]);

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return exam.trim().length > 0;
    return mode !== null;
  }, [step, name, exam, mode]);

  const next = () => {
    if (!canContinue) return;
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    showToast(mode === 'preset' ? 'Preset imported' : 'Custom setup started');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 36, paddingBottom: 30 }}>
        <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
        <Text className="mt-2 font-display text-[46px] leading-[50px] text-white">Welcome</Text>
        <Text className="mt-2 max-w-[460px] font-body text-[14px] leading-[22px] text-void-text-secondary">
          Quick auth setup before we load your workspace.
        </Text>

        <View className="mt-8 flex-row gap-2">
          {[0, 1, 2].map((idx) => (
            <View
              key={idx}
              className={clsx('h-1.5 flex-1 rounded-full', step >= idx ? 'bg-[#70b1ff]' : 'bg-white/12')}
            />
          ))}
        </View>

        <View
          className="mt-6 rounded-[20px] bg-[rgba(19,19,19,0.78)] p-5"
          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.22)' }}
        >
          {step === 0 ? (
            <>
              <Text className="font-section text-[26px] text-white">What should we call you?</Text>
              <Text className="mt-1 font-body text-[13px] text-void-text-secondary">Name used in profile and group boards.</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#6f767a"
                className="mt-5 rounded-[14px] border border-white/20 bg-[rgba(17,19,21,0.8)] px-4 py-3 text-white"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text className="font-section text-[26px] text-white">Which exam are you preparing for?</Text>
              <Text className="mt-1 font-body text-[13px] text-void-text-secondary">This helps shape timers, plans, and defaults.</Text>
              <View className="mt-5 flex-row flex-wrap gap-2">
                {EXAMS.map((x) => (
                  <Pressable
                    key={x}
                    onPress={() => setExam(x)}
                    className={clsx('rounded-full px-3.5 py-2', exam === x ? 'bg-[#4ea4ff33]' : 'bg-[rgba(17,19,21,0.75)]')}
                    style={{ borderWidth: 1, borderColor: exam === x ? 'rgba(112,177,255,0.52)' : 'rgba(214,235,253,0.18)' }}
                  >
                    <Text className={clsx('font-mono text-[11px] uppercase', exam === x ? 'text-[#70b1ff]' : 'text-white')}>{x}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text className="font-section text-[26px] text-white">Start with a preset or build your own?</Text>
              <Text className="mt-1 font-body text-[13px] text-void-text-secondary">You can always change this later.</Text>

              <View className="mt-5 gap-3">
                <Pressable
                  onPress={() => setMode('preset')}
                  className={clsx('rounded-[14px] p-4', mode === 'preset' ? 'bg-[#4ea4ff22]' : 'bg-[rgba(17,19,21,0.75)]')}
                  style={{ borderWidth: 1, borderColor: mode === 'preset' ? 'rgba(112,177,255,0.52)' : 'rgba(214,235,253,0.18)' }}
                >
                  <Text className="font-body text-[15px] text-white">Import Preset</Text>
                  <Text className="mt-1 font-body text-[12px] text-void-text-secondary">Load tested study structures instantly.</Text>
                </Pressable>

                <Pressable
                  onPress={() => setMode('custom')}
                  className={clsx('rounded-[14px] p-4', mode === 'custom' ? 'bg-[#01fc971f]' : 'bg-[rgba(17,19,21,0.75)]')}
                  style={{ borderWidth: 1, borderColor: mode === 'custom' ? 'rgba(1,252,151,0.45)' : 'rgba(214,235,253,0.18)' }}
                >
                  <Text className="font-body text-[15px] text-white">Make My Own</Text>
                  <Text className="mt-1 font-body text-[12px] text-void-text-secondary">Start from scratch and tune every detail.</Text>
                </Pressable>
              </View>

              {mode === 'preset' ? (
                <View className="mt-5">
                  <Text className="mb-2 font-mono text-[10px] uppercase tracking-[1px] text-void-text-secondary">Pick a preset</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {PRESETS.map((p) => (
                        <Pressable
                          key={p}
                          onPress={() => setPreset(p)}
                          className={clsx('rounded-full px-3.5 py-2', preset === p ? 'bg-white/14' : 'bg-[rgba(17,19,21,0.75)]')}
                          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.20)' }}
                        >
                          <Text className={clsx('font-mono text-[10px] uppercase', preset === p ? 'text-white' : 'text-void-text-secondary')}>
                            {p}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              ) : null}
            </>
          ) : null}

          <View className="mt-7 flex-row items-center justify-between">
            <Pressable
              onPress={() => (step === 0 ? router.replace('/(tabs)') : setStep((s) => s - 1))}
              className="rounded-full border border-white/20 px-4 py-2.5"
            >
              <Text className="font-body text-[13px] text-white">{step === 0 ? 'Skip for now' : 'Back'}</Text>
            </Pressable>

            <Pressable
              onPress={next}
              disabled={!canContinue}
              className={clsx('rounded-full px-5 py-2.5', canContinue ? 'bg-[#4ea4ff]' : 'bg-white/10')}
            >
              <Text className={clsx('font-body text-[13px]', canContinue ? 'text-[#001b32]' : 'text-void-text-secondary')}>
                {step < 2 ? 'Continue' : 'Enter App'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

