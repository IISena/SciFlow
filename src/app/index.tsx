import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BioHeader, BottomNav, SectionTitle } from "@/components/bio-shell";
import { cfsProtocolShortcut, cfsSteps } from "@/constants/cfs-protocol";
import { colors, Fonts } from "@/constants/theme";
import { ExecutionRecord, getActiveExecution, getLastVisitedProtocol, ProtocolShortcut } from "@/services/storage";

function formatTime(value: number) {
  return [Math.floor(value / 3600), Math.floor((value % 3600) / 60), value % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function getRemainingSeconds(execution: ExecutionRecord, now: number) {
  const step = cfsSteps[execution.currentStepIndex];
  if (!step) return 0;
  const timer = execution.timers[step.id];
  if (timer?.isRunning && timer.endAt) return Math.max(0, Math.ceil((timer.endAt - now) / 1000));
  return timer?.remainingSeconds ?? step.seconds;
}

export default function HomeScreen() {
  const [active, setActive] = useState<ExecutionRecord | null>(null);
  const [lastProtocol, setLastProtocol] = useState<ProtocolShortcut | null>(null);
  const [now, setNow] = useState(Date.now());

  useFocusEffect(useCallback(() => {
    void Promise.all([getActiveExecution(), getLastVisitedProtocol()]).then(([execution, protocol]) => {
      setActive(execution);
      if (protocol) setLastProtocol(protocol);
      setNow(Date.now());
    });
  }, []));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const activeStep = active ? cfsSteps[active.currentStepIndex] : null;
  const remaining = useMemo(() => active ? getRemainingSeconds(active, now) : 0, [active, now]);
  const progress = active ? Math.round(((active.currentStepIndex + 1) / cfsSteps.length) * 100) : 0;
  const hasTimer = Boolean(activeStep?.seconds);
  const quickAccess = [
    { icon: "⚗", label: lastProtocol ? "ÚLTIMO PROTOCOLO" : "PROTOCOLO DISPONÍVEL", title: (lastProtocol ?? cfsProtocolShortcut).name, detail: (lastProtocol ?? cfsProtocolShortcut).code, route: (lastProtocol ?? cfsProtocolShortcut).route },
    { icon: "▤", label: "REFERÊNCIA", title: "Artigos", detail: "Base científica", route: "/articles" },
    { icon: "≡", label: "REGISTROS", title: "Anotações", detail: "Diário de bancada", route: "/notes" },
  ];

  return <View style={styles.screen}>
    <BioHeader />
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.terminal}><View style={styles.dot} /><Text style={styles.terminalText}>BIOTERMINAL • SISTEMA LOCAL</Text></View>
      <Text selectable style={styles.greeting}>Painel de bancada</Text>
      <Text style={styles.lab}>Protocolos, execução e registros em um único fluxo.</Text>

      {active && activeStep ? <View style={styles.activeCard}>
        <View style={styles.cardTop}><View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>PROTOCOLO EM PROCESSO</Text></View><Text selectable style={styles.ref}>PRT-001</Text></View>
        <View style={styles.mainRow}><View style={styles.flex}><Text style={styles.muted}>Execução ativa</Text><Text selectable style={styles.protocol}>{active.protocolName}</Text><Text selectable style={styles.stage}>ETAPA {active.currentStepIndex + 1}/{cfsSteps.length} • {activeStep.title}</Text></View><View style={styles.gauge}><Text selectable style={styles.gaugeText}>{progress}%</Text></View></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <View style={styles.timer}><View><Text style={styles.timerLabel}>{hasTimer ? "TEMPO RESTANTE" : "ETAPA MANUAL"}</Text><Text selectable style={styles.timerValue}>{hasTimer ? formatTime(remaining) : "SEM CRONÔMETRO"}</Text></View><View style={styles.timerState}><Text style={styles.timerStateText}>{hasTimer && remaining > 0 && active.timers[activeStep.id]?.isRunning ? "● EM CURSO" : "PRONTO"}</Text></View></View>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/protocols/cfs-execution")}><Text style={styles.primaryButtonText}>▶  Retomar execução</Text></Pressable>
      </View> : <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>⚗</Text></View>
        <View style={styles.flex}><Text style={styles.emptyKicker}>BANCADA DISPONÍVEL</Text><Text selectable style={styles.emptyTitle}>Nenhum protocolo em processo</Text><Text style={styles.emptyDetail}>Escolha um protocolo para preparar uma nova execução.</Text></View>
        <Pressable style={styles.outlineButton} onPress={() => router.push("/protocols")}><Text style={styles.outlineButtonText}>Abrir biblioteca →</Text></Pressable>
      </View>}

      <SectionTitle detail="ATALHOS">Acesso rápido</SectionTitle>
      <View style={styles.quickGrid}>{quickAccess.map((item) => <Pressable key={item.label} style={styles.quickCard} onPress={() => router.push(item.route as never)}>
        <View style={styles.quickTop}><Text style={styles.quickIcon}>{item.icon}</Text><Text style={styles.quickArrow}>↗</Text></View>
        <Text style={styles.quickLabel}>{item.label}</Text><Text selectable style={styles.quickTitle}>{item.title}</Text><Text style={styles.quickDetail}>{item.detail}</Text>
      </Pressable>)}</View>
    </ScrollView>
    <BottomNav active="home" />
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:110,gap:14},terminal:{flexDirection:"row",alignItems:"center",gap:7},dot:{width:7,height:7,borderRadius:4,backgroundColor:colors.primary,boxShadow:"0 0 9px #00F59B"},terminalText:{color:colors.primarySoft,fontSize:9,fontFamily:Fonts.mono,letterSpacing:1.2,fontWeight:"700"},greeting:{color:colors.text,fontSize:25,fontWeight:"800"},lab:{color:colors.textSecondary,fontSize:11,lineHeight:17},activeCard:{backgroundColor:colors.surfaceLow,borderRadius:16,padding:16,gap:14,borderTopWidth:1,borderTopColor:colors.primary,boxShadow:"0 14px 28px rgba(0,0,0,0.35)"},cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},status:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:colors.surfaceHigh,paddingHorizontal:10,paddingVertical:6,borderRadius:15},statusText:{color:colors.primarySoft,fontSize:8,fontFamily:Fonts.mono,fontWeight:"800"},ref:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:9},mainRow:{flexDirection:"row",alignItems:"center",gap:10},flex:{flex:1},muted:{color:colors.textSecondary,fontSize:10},protocol:{color:colors.text,fontSize:20,fontWeight:"800",marginTop:2},stage:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,marginTop:6,lineHeight:13},gauge:{width:62,height:62,borderRadius:31,borderWidth:6,borderColor:colors.primary,alignItems:"center",justifyContent:"center",backgroundColor:colors.surface},gaugeText:{color:colors.text,fontFamily:Fonts.mono,fontWeight:"800"},progressTrack:{height:4,borderRadius:2,backgroundColor:colors.surfaceHigh,overflow:"hidden"},progressFill:{height:4,borderRadius:2,backgroundColor:colors.primary},timer:{backgroundColor:colors.surfaceLowest,borderRadius:12,padding:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderWidth:1,borderColor:colors.surfaceHigh},timerLabel:{color:colors.textSecondary,fontSize:8,fontFamily:Fonts.mono,letterSpacing:1},timerValue:{color:colors.secondary,fontSize:21,fontFamily:Fonts.mono,fontWeight:"700",fontVariant:["tabular-nums"],marginTop:3},timerState:{backgroundColor:colors.surfaceHigh,paddingHorizontal:9,paddingVertical:6,borderRadius:9},timerStateText:{color:colors.primarySoft,fontSize:8,fontFamily:Fonts.mono,fontWeight:"700"},primaryButton:{height:48,borderRadius:12,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px rgba(0,245,155,0.22)"},primaryButtonText:{color:colors.primaryDark,fontWeight:"900",fontSize:12},emptyCard:{backgroundColor:colors.surfaceLow,borderRadius:16,padding:16,gap:13,borderWidth:1,borderColor:colors.surfaceHigh},emptyIcon:{width:46,height:46,borderRadius:13,backgroundColor:colors.surfaceHigh,alignItems:"center",justifyContent:"center"},emptyIconText:{color:colors.primarySoft,fontSize:23},emptyKicker:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,letterSpacing:1},emptyTitle:{color:colors.text,fontSize:18,fontWeight:"800",marginTop:4},emptyDetail:{color:colors.textSecondary,fontSize:11,lineHeight:17,marginTop:4},outlineButton:{height:44,borderRadius:10,borderWidth:1,borderColor:colors.primary,alignItems:"center",justifyContent:"center"},outlineButtonText:{color:colors.primarySoft,fontWeight:"800",fontSize:11},quickGrid:{gap:9},quickCard:{backgroundColor:colors.surfaceLow,borderRadius:13,padding:14,minHeight:112,justifyContent:"center",borderWidth:1,borderColor:colors.surfaceHigh},quickTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},quickIcon:{color:colors.primarySoft,fontSize:23},quickArrow:{color:colors.outline,fontSize:15},quickLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:7,letterSpacing:1,marginTop:9},quickTitle:{color:colors.text,fontSize:15,fontWeight:"800",marginTop:4},quickDetail:{color:colors.textSecondary,fontSize:10,marginTop:3},
});
