import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BioHeader, BottomNav, SectionTitle } from "@/components/bio-shell";
import { colors, Fonts } from "@/constants/theme";
import { ExecutionRecord, getActiveExecution } from "@/services/storage";

const quick = [
  { icon: "⌁", title: "Diluições", detail: "C₁V₁ = C₂V₂", route: "/protocols/cfs" },
  { icon: "⚗", title: "Protocolos", detail: "4 verificados", route: "/protocols" },
  { icon: "◷", title: "Histórico Lotes", detail: "Rastreabilidade", route: "/history" },
  { icon: "▤", title: "Artigos & Docs", detail: "Base PubMed", route: "/articles" },
];

export default function HomeScreen() {
  const [active, setActive] = useState<ExecutionRecord | null>(null);
  const [seconds, setSeconds] = useState(47 * 3600 + 59 * 60 + 55);
  useFocusEffect(useCallback(() => { void getActiveExecution().then(setActive); }, []));
  useEffect(() => { const id = setInterval(() => setSeconds((v) => Math.max(v - 1, 0)), 1000); return () => clearInterval(id); }, []);
  const current = active ? active.currentStepIndex + 1 : 3;
  const progress = Math.round((current / 8) * 100);
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((v) => String(v).padStart(2, "0")).join(":");
  const executionRoute = active ? "/protocols/cfs-execution" : "/protocols/cfs";

  return <View style={styles.screen}><BioHeader /><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.terminal}><View style={styles.dot} /><Text style={styles.terminalText}>BIOTERMINAL V4.12</Text></View>
    <Text selectable style={styles.greeting}>Olá, Dra. Helena</Text><Text selectable style={styles.lab}>⌂  Laboratório de Bioprocessos • Turno Ativo</Text>
    <View style={styles.activeCard}>
      <View style={styles.cardTop}><View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>BIO-REATOR EM CURSO</Text></View><Text style={styles.ref}>REF: #492A</Text></View>
      <View style={styles.mainRow}><View style={styles.flex}><Text style={styles.muted}>Lote Ativo</Text><Text selectable style={styles.protocol}>Produção de CFS</Text><Text style={styles.stage}>◌  Etapa {current} de 8 ({progress}%)</Text></View><View style={styles.gauge}><Text style={styles.gaugeText}>{progress}%</Text></View></View>
      <View style={styles.timer}><View><Text style={styles.timerLabel}>⌛ TEMPO RESTANTE</Text><Text selectable style={styles.timerValue}>{clock}</Text></View><View><Text style={styles.timerLabel}>FASE</Text><Text style={styles.phase}>FERMENTAÇÃO</Text></View></View>
      <Pressable style={styles.primaryButton} onPress={() => router.push(executionRoute as never)}><Text style={styles.primaryButtonText}>▶  {active ? "Retomar Ensaio" : "Iniciar Ensaio"}</Text></Pressable>
    </View>
    <View style={styles.metrics}>{[["♨","Incubadora","30.2°C","Meta: 30°C"],["↻","Agitação","150 RPM","Orbital OK"],["⚗","Amostras","n=12","4 Controles"]].map(([icon,label,value,detail]) => <View key={label} style={styles.metric}><Text style={styles.metricIcon}>{icon}</Text><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>)}</View>
    <SectionTitle detail="OPERAÇÕES">Acesso Rápido</SectionTitle><View style={styles.quickGrid}>{quick.map((item) => <Pressable key={item.title} style={styles.quickCard} onPress={() => router.push(item.route as never)}><Text style={styles.quickIcon}>{item.icon}</Text><Text style={styles.quickTitle}>{item.title}</Text><Text style={styles.quickDetail}>{item.detail}</Text></Pressable>)}</View>
    <SectionTitle detail="3 PENDENTES">Cronograma de Hoje</SectionTitle><View style={styles.timeline}>{[["10:30 • EM 35 MIN","Verificação de Densidade Óptica","Espectrofotômetro a OD600 em triplicata"],["14:00","Inoculação de Controle","Preparar suspensão bacteriana fresca"],["16:30","Coleta de Alíquotas","Criopreservação e dosagem de metabólitos"]].map(([time,title,detail]) => <View key={time} style={styles.task}><View style={styles.taskDot} /><View style={styles.flex}><Text style={styles.taskTime}>{time}</Text><Text style={styles.taskTitle}>{title}</Text><Text style={styles.taskDetail}>{detail}</Text></View></View>)}</View>
  </ScrollView><BottomNav active="home" /></View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:110,gap:14},terminal:{flexDirection:"row",alignItems:"center",gap:7},dot:{width:7,height:7,borderRadius:4,backgroundColor:colors.primary,boxShadow:"0 0 9px #00F59B"},terminalText:{color:colors.primarySoft,fontSize:9,fontFamily:Fonts.mono,letterSpacing:1.4,fontWeight:"700"},greeting:{color:colors.text,fontSize:24,fontWeight:"800"},lab:{color:colors.textSecondary,fontSize:11},activeCard:{backgroundColor:colors.surfaceLow,borderRadius:16,padding:16,gap:14,borderTopWidth:1,borderTopColor:colors.primary,boxShadow:"0 14px 28px rgba(0,0,0,0.35)"},cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},status:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:colors.surfaceHigh,paddingHorizontal:10,paddingVertical:6,borderRadius:15},statusText:{color:colors.primarySoft,fontSize:9,fontFamily:Fonts.mono,fontWeight:"800"},ref:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:9},mainRow:{flexDirection:"row",alignItems:"center",gap:10},flex:{flex:1},muted:{color:colors.textSecondary,fontSize:11},protocol:{color:colors.text,fontSize:20,fontWeight:"800",marginTop:2},stage:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:10,marginTop:5},gauge:{width:64,height:64,borderRadius:32,borderWidth:7,borderColor:colors.primary,alignItems:"center",justifyContent:"center",backgroundColor:colors.surface},gaugeText:{color:colors.text,fontFamily:Fonts.mono,fontWeight:"800"},timer:{backgroundColor:colors.surfaceLowest,borderRadius:12,padding:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderWidth:1,borderColor:colors.surfaceHigh},timerLabel:{color:colors.textSecondary,fontSize:8,fontFamily:Fonts.mono,letterSpacing:1},timerValue:{color:colors.secondary,fontSize:23,fontFamily:Fonts.mono,fontWeight:"700",fontVariant:["tabular-nums"]},phase:{color:colors.primarySoft,fontSize:9,fontFamily:Fonts.mono,fontWeight:"800",marginTop:5},primaryButton:{height:48,borderRadius:12,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px rgba(0,245,155,0.26)"},primaryButtonText:{color:colors.primaryDark,fontWeight:"900",fontSize:13},metrics:{flexDirection:"row",gap:8},metric:{flex:1,minHeight:106,backgroundColor:colors.surfaceLow,borderRadius:12,padding:10,alignItems:"center",justifyContent:"center",gap:2},metricIcon:{color:colors.primarySoft,fontSize:18},metricLabel:{color:colors.textSecondary,fontSize:8,fontFamily:Fonts.mono},metricValue:{color:colors.text,fontSize:14,fontFamily:Fonts.mono,fontWeight:"800"},metricDetail:{color:colors.outline,fontSize:8},quickGrid:{flexDirection:"row",flexWrap:"wrap",gap:9},quickCard:{width:"48.5%",backgroundColor:colors.surfaceLow,borderRadius:13,padding:13,minHeight:112,justifyContent:"center"},quickIcon:{color:colors.primarySoft,fontSize:23},quickTitle:{color:colors.text,fontSize:14,fontWeight:"800",marginTop:8},quickDetail:{color:colors.textSecondary,fontSize:10,marginTop:3},timeline:{backgroundColor:colors.surfaceLow,borderRadius:14,padding:14,gap:17},task:{flexDirection:"row",gap:11},taskDot:{width:13,height:13,borderRadius:7,borderWidth:2,borderColor:colors.primary,marginTop:3},taskTime:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:9,fontWeight:"700"},taskTitle:{color:colors.text,fontSize:13,fontWeight:"700",marginTop:3},taskDetail:{color:colors.textSecondary,fontSize:10,lineHeight:15,marginTop:2},
});
