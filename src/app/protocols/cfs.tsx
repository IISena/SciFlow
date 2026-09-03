import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { BioHeader, BottomNav, SectionTitle } from "@/components/bio-shell";
import { cfsProtocolShortcut, cfsSteps } from "@/constants/cfs-protocol";
import { colors, Fonts } from "@/constants/theme";
import { ExecutionRecord, getActiveExecution, saveActiveExecution, saveLastVisitedProtocol } from "@/services/storage";

const conditions = [
  { icon: "♨", label: "TEMPERATURA", value: "27", unit: "°C" },
  { icon: "↻", label: "AGITAÇÃO", value: "150", unit: "RPM" },
  { icon: "◷", label: "INCUBAÇÃO", value: "48", unit: "H" },
];

const processing = [
  ["Centrifugação", "3067.34 RCF"],
  ["Temperatura", "4°C"],
  ["Tempo", "60 min"],
  ["Filtração", "0,22 µm"],
];

const materials = [
  ["01", "Meio TSB", "Tryptic Soy Broth"],
  ["02", "Cultura bacteriana", "Xenorhabdus ou Photorhabdus"],
  ["03", "Recipientes para centrifugação", "Compatíveis com refrigeração"],
  ["04", "Filtro estéril", "Porosidade 0,22 µm"],
  ["05", "Recipiente estéril", "Coleta do sobrenadante"],
];

export default function CFSProtocolScreen() {
  const [numberOfCultures, setNumberOfCultures] = useState("");
  const [volumePerCulture, setVolumePerCulture] = useState("");
  const [totalVolume, setTotalVolume] = useState<number | null>(null);

  useEffect(() => { void saveLastVisitedProtocol(cfsProtocolShortcut); }, []);

  function parseNumber(value: string) { return Number(value.replace(",", ".")); }

  function calculateVolume() {
    const cultures = parseNumber(numberOfCultures);
    const volume = parseNumber(volumePerCulture);
    if (cultures <= 0 || volume <= 0) {
      Alert.alert("Dados incompletos", "Informe valores maiores que zero.");
      return;
    }
    setTotalVolume(cultures * volume);
  }

  async function createExecution(cultures: number, volume: number) {
    const now = new Date().toISOString();
    const execution: ExecutionRecord = {
      id: Date.now().toString(), protocolId: "cfs", protocolName: "Produção de CFS",
      status: "in_progress", startedAt: now, updatedAt: now, currentStepIndex: 0,
      numberOfCultures: cultures, volumePerCulture: volume, totalVolume: cultures * volume,
      notes: {}, timers: {},
    };
    await saveActiveExecution(execution);
    router.push("/protocols/cfs-execution");
  }

  async function startProtocol() {
    const cultures = parseNumber(numberOfCultures);
    const volume = parseNumber(volumePerCulture);
    if (cultures <= 0 || volume <= 0) {
      Alert.alert("Prepare o experimento", "Informe o número de culturas e o volume de TSB por cultura antes de iniciar.");
      return;
    }
    const active = await getActiveExecution();
    if (!active) { await createExecution(cultures, volume); return; }
    Alert.alert("Já existe um protocolo em andamento", "Você pode continuar a execução atual ou iniciar uma nova execução.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Continuar atual", onPress: () => router.push("/protocols/cfs-execution") },
      { text: "Iniciar nova", style: "destructive", onPress: () => { void createExecution(cultures, volume); } },
    ]);
  }

  return <View style={styles.screen}>
    <BioHeader compact />
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>←  Biblioteca de protocolos</Text></Pressable>

      <View style={styles.hero}>
        <View style={styles.badgeRow}><View style={styles.codeBadge}><Text style={styles.code}>PRT-001</Text></View><View style={styles.activeBadge}><View style={styles.dot} /><Text style={styles.activeText}>EXECUÇÃO DISPONÍVEL</Text></View></View>
        <Text selectable style={styles.title}>Produção de CFS</Text>
        <Text style={styles.subtitle}>Sobrenadante livre de células para ensaios de atividade antifúngica.</Text>
        <View style={styles.target}><Text style={styles.targetLabel}>ORGANISMOS-ALVO</Text><Text selectable style={styles.targetValue}>Xenorhabdus spp. • Photorhabdus spp.</Text></View>
      </View>

      <SectionTitle detail={`${cfsSteps.length} ETAPAS`}>Condições de cultivo</SectionTitle>
      <View style={styles.conditions}>{conditions.map((item) => <View key={item.label} style={styles.conditionCard}><Text style={styles.conditionIcon}>{item.icon}</Text><Text style={styles.conditionLabel}>{item.label}</Text><Text selectable style={styles.conditionValue}>{item.value}<Text style={styles.conditionUnit}> {item.unit}</Text></Text></View>)}</View>

      <View style={styles.card}>
        <Text style={styles.cardKicker}>VISÃO GERAL</Text>
        <Text style={styles.description}>Produção de sobrenadante livre de células a partir de culturas bacterianas, com separação por centrifugação refrigerada e filtração estéril para uso em ensaios antifúngicos.</Text>
      </View>

      <SectionTitle detail="PARÂMETROS">Processamento</SectionTitle>
      <View style={styles.card}>{processing.map(([name, value], index) => <View key={name} style={[styles.parameter, index < processing.length - 1 && styles.divider]}><Text style={styles.parameterName}>{name}</Text><Text selectable style={styles.parameterValue}>{value}</Text></View>)}</View>

      <SectionTitle detail="CHECKLIST">Materiais principais</SectionTitle>
      <View style={styles.card}>{materials.map(([number, name, detail]) => <View key={number} style={styles.material}><View style={styles.materialNumber}><Text style={styles.materialNumberText}>{number}</Text></View><View style={styles.flex}><Text selectable style={styles.materialName}>{name}</Text><Text style={styles.materialDetail}>{detail}</Text></View><Text style={styles.check}>○</Text></View>)}</View>

      <View style={styles.calculator}>
        <View style={styles.calculatorHeader}><View style={styles.calcIcon}><Text style={styles.calcIconText}>⌁</Text></View><View style={styles.flex}><Text style={styles.cardKicker}>PREPARAR EXPERIMENTO</Text><Text selectable style={styles.calculatorTitle}>Calculadora de TSB</Text></View></View>
        <Text style={styles.calculatorSubtitle}>Dimensione o volume do meio para esta execução.</Text>
        <View style={styles.fieldRow}><View style={styles.field}><Text style={styles.inputLabel}>NÚMERO DE CULTURAS</Text><TextInput value={numberOfCultures} onChangeText={setNumberOfCultures} style={styles.input} keyboardType="numeric" placeholder="Ex.: 4" placeholderTextColor={colors.outline} /></View><View style={styles.field}><Text style={styles.inputLabel}>VOLUME POR CULTURA</Text><View style={styles.inputWithUnit}><TextInput value={volumePerCulture} onChangeText={setVolumePerCulture} style={styles.unitInput} keyboardType="decimal-pad" placeholder="Ex.: 300" placeholderTextColor={colors.outline} /><Text style={styles.unit}>mL</Text></View></View></View>
        <Pressable style={styles.calculateButton} onPress={calculateVolume}><Text style={styles.calculateText}>CALCULAR VOLUME</Text></Pressable>
        {totalVolume !== null && <View style={styles.result}><View><Text style={styles.resultLabel}>VOLUME TOTAL DE TSB</Text><Text style={styles.formula}>{numberOfCultures} × {volumePerCulture} mL</Text></View><Text selectable style={styles.resultValue}>{totalVolume.toLocaleString("pt-BR")} <Text style={styles.resultUnit}>mL</Text></Text></View>}
      </View>

      <Pressable style={styles.reference} onPress={() => router.push("/articles")}><View style={styles.referenceIcon}><Text style={styles.referenceIconText}>▤</Text></View><View style={styles.flex}><Text style={styles.cardKicker}>FONTE CIENTÍFICA</Text><Text selectable style={styles.referenceTitle}>Chacón-Orozco et al., 2020</Text><Text style={styles.referenceDetail}>Scientific Reports • DOI 10.1038/s41598-020-77472-6</Text></View><Text style={styles.referenceArrow}>↗</Text></Pressable>

      <Pressable style={styles.startButton} onPress={() => void startProtocol()}><View><Text style={styles.startKicker}>CONFIGURAÇÃO PRONTA</Text><Text style={styles.startText}>Iniciar protocolo</Text></View><Text style={styles.startArrow}>→</Text></Pressable>
    </ScrollView>
    <BottomNav active="protocols" />
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:115,gap:14},back:{alignSelf:"flex-start",paddingVertical:5},backText:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:9},hero:{backgroundColor:colors.surfaceLow,borderRadius:17,padding:17,gap:11,borderTopWidth:1,borderTopColor:colors.primary,boxShadow:"0 14px 28px rgba(0,0,0,.3)"},badgeRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},codeBadge:{backgroundColor:"rgba(0,245,155,.12)",paddingHorizontal:9,paddingVertical:5,borderRadius:6},code:{color:colors.primarySoft,fontFamily:Fonts.mono,fontWeight:"800",fontSize:9},activeBadge:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:colors.surfaceHigh,paddingHorizontal:9,paddingVertical:5,borderRadius:12},dot:{width:6,height:6,borderRadius:3,backgroundColor:colors.primary,boxShadow:"0 0 7px #00F59B"},activeText:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:7,fontWeight:"800"},title:{color:colors.text,fontSize:27,fontWeight:"900"},subtitle:{color:colors.textSecondary,fontSize:12,lineHeight:19},target:{backgroundColor:colors.surfaceLowest,borderRadius:10,padding:11,gap:4},targetLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:7,letterSpacing:1},targetValue:{color:colors.text,fontFamily:Fonts.mono,fontSize:10,fontWeight:"700"},conditions:{flexDirection:"row",gap:8},conditionCard:{flex:1,backgroundColor:colors.surfaceLow,borderRadius:12,padding:10,minHeight:104,justifyContent:"center",borderWidth:1,borderColor:colors.surfaceHigh},conditionIcon:{color:colors.primarySoft,fontSize:18},conditionLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:7,marginTop:7},conditionValue:{color:colors.text,fontFamily:Fonts.mono,fontSize:17,fontWeight:"800",marginTop:3},conditionUnit:{color:colors.primarySoft,fontSize:8},card:{backgroundColor:colors.surfaceLow,borderRadius:14,padding:14,gap:2,borderWidth:1,borderColor:colors.surfaceHigh},cardKicker:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,fontWeight:"800",letterSpacing:1},description:{color:colors.textSecondary,fontSize:12,lineHeight:19,marginTop:7},parameter:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:11},divider:{borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.surfaceHigh},parameterName:{color:colors.textSecondary,fontSize:11},parameterValue:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:10,fontWeight:"800"},material:{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:9},materialNumber:{width:31,height:31,borderRadius:9,backgroundColor:colors.surfaceHigh,alignItems:"center",justifyContent:"center"},materialNumberText:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,fontWeight:"800"},flex:{flex:1},materialName:{color:colors.text,fontSize:11,fontWeight:"700"},materialDetail:{color:colors.textSecondary,fontSize:9,marginTop:2},check:{color:colors.outline,fontSize:18},calculator:{backgroundColor:colors.surfaceLow,borderRadius:16,padding:15,gap:13,borderWidth:1,borderColor:"rgba(0,245,155,.32)"},calculatorHeader:{flexDirection:"row",alignItems:"center",gap:10},calcIcon:{width:40,height:40,borderRadius:11,backgroundColor:"rgba(0,245,155,.12)",alignItems:"center",justifyContent:"center"},calcIconText:{color:colors.primarySoft,fontSize:22},calculatorTitle:{color:colors.text,fontSize:17,fontWeight:"800",marginTop:2},calculatorSubtitle:{color:colors.textSecondary,fontSize:10},fieldRow:{flexDirection:"row",gap:8},field:{flex:1,gap:6},inputLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:7},input:{height:45,backgroundColor:colors.surfaceLowest,borderRadius:10,borderWidth:1,borderColor:colors.surfaceHigh,color:colors.text,paddingHorizontal:11,fontFamily:Fonts.mono},inputWithUnit:{height:45,backgroundColor:colors.surfaceLowest,borderRadius:10,borderWidth:1,borderColor:colors.surfaceHigh,flexDirection:"row",alignItems:"center"},unitInput:{flex:1,color:colors.text,paddingHorizontal:11,fontFamily:Fonts.mono},unit:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:9,paddingRight:10},calculateButton:{height:44,borderRadius:10,backgroundColor:colors.surfaceHigh,alignItems:"center",justifyContent:"center"},calculateText:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:9,fontWeight:"800"},result:{backgroundColor:"rgba(0,245,155,.1)",borderRadius:11,padding:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},resultLabel:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:7},formula:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:8,marginTop:4},resultValue:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:20,fontWeight:"900"},resultUnit:{fontSize:9},reference:{backgroundColor:colors.surfaceLow,borderRadius:14,padding:13,flexDirection:"row",alignItems:"center",gap:10,borderWidth:1,borderColor:colors.surfaceHigh},referenceIcon:{width:38,height:38,borderRadius:10,backgroundColor:colors.surfaceHigh,alignItems:"center",justifyContent:"center"},referenceIconText:{color:colors.primarySoft,fontSize:19},referenceTitle:{color:colors.text,fontSize:12,fontWeight:"800",marginTop:3},referenceDetail:{color:colors.textSecondary,fontSize:8,marginTop:3},referenceArrow:{color:colors.primarySoft,fontSize:17},startButton:{minHeight:62,borderRadius:14,backgroundColor:colors.primary,paddingHorizontal:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between",boxShadow:"0 0 18px rgba(0,245,155,.2)"},startKicker:{color:colors.primaryDark,fontFamily:Fonts.mono,fontSize:7,fontWeight:"800"},startText:{color:colors.primaryDark,fontSize:16,fontWeight:"900",marginTop:2},startArrow:{color:colors.primaryDark,fontSize:25},
});
