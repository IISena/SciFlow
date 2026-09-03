import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BioHeader, BottomNav, SectionTitle } from "@/components/bio-shell";
import { colors, Fonts } from "@/constants/theme";
import { ExecutionRecord, getHistory } from "@/services/storage";

function formatDate(date?: string) {
  return date ? new Date(date).toLocaleString("pt-BR") : "";
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<ExecutionRecord[]>([]);

  useFocusEffect(useCallback(() => { void getHistory().then(setHistory); }, []));

  return <View style={styles.screen}>
    <BioHeader compact />
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}><View><Text style={styles.kicker}>RASTREABILIDADE LOCAL</Text><Text selectable style={styles.title}>Histórico de protocolos</Text><Text style={styles.subtitle}>Execuções concluídas e configurações experimentais.</Text></View><View style={styles.counter}><Text selectable style={styles.counterValue}>{history.length}</Text><Text style={styles.counterLabel}>REGISTROS</Text></View></View>

      <SectionTitle detail="CONCLUÍDOS">Execuções</SectionTitle>
      {history.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>▦</Text></View><Text selectable style={styles.emptyTitle}>Nenhuma execução concluída</Text><Text style={styles.emptyText}>Ao finalizar um protocolo, os dados da execução aparecerão aqui automaticamente.</Text><Pressable style={styles.openButton} onPress={() => router.push("/protocols")}><Text style={styles.openButtonText}>Abrir protocolos →</Text></Pressable></View> : history.map((execution) => {
        const notes = Object.values(execution.notes).filter((note) => note.trim());
        return <View key={execution.id} style={styles.card}>
          <View style={styles.cardTop}><View style={styles.status}><Text style={styles.statusText}>✓ CONCLUÍDO</Text></View><Text style={styles.code}>PRT-001</Text></View>
          <Text selectable style={styles.protocolName}>{execution.protocolName}</Text>
          <Text selectable style={styles.date}>◷ {formatDate(execution.completedAt)}</Text>
          <View style={styles.divider} />
          <View style={styles.dataGrid}><View style={styles.dataItem}><Text style={styles.dataLabel}>CULTURAS</Text><Text selectable style={styles.dataValue}>{execution.numberOfCultures}</Text></View><View style={styles.dataItem}><Text style={styles.dataLabel}>POR CULTURA</Text><Text selectable style={styles.dataValue}>{execution.volumePerCulture} mL</Text></View><View style={styles.dataItem}><Text style={styles.dataLabel}>VOLUME TOTAL</Text><Text selectable style={styles.dataValueAccent}>{execution.totalVolume} mL</Text></View></View>
          {notes.length > 0 && <View style={styles.notes}><Text style={styles.dataLabel}>ANOTAÇÕES DA EXECUÇÃO</Text>{notes.map((note, index) => <Text selectable key={`${execution.id}-${index}`} style={styles.note}>• {note}</Text>)}</View>}
        </View>;
      })}
    </ScrollView>
    <BottomNav active="history" />
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:110,gap:14},heading:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12},kicker:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,letterSpacing:1},title:{color:colors.text,fontSize:24,fontWeight:"900",marginTop:4},subtitle:{color:colors.textSecondary,fontSize:10,lineHeight:16,marginTop:4},counter:{width:64,height:64,borderRadius:32,borderWidth:5,borderColor:colors.primary,alignItems:"center",justifyContent:"center",backgroundColor:colors.surfaceLow},counterValue:{color:colors.text,fontFamily:Fonts.mono,fontSize:17,fontWeight:"900"},counterLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:6},empty:{backgroundColor:colors.surfaceLow,borderRadius:16,padding:24,alignItems:"center",gap:9,borderWidth:1,borderColor:colors.surfaceHigh},emptyIcon:{width:52,height:52,borderRadius:15,backgroundColor:colors.surfaceHigh,alignItems:"center",justifyContent:"center"},emptyIconText:{color:colors.primarySoft,fontSize:25},emptyTitle:{color:colors.text,fontSize:17,fontWeight:"800",textAlign:"center"},emptyText:{color:colors.textSecondary,fontSize:11,lineHeight:17,textAlign:"center",maxWidth:300},openButton:{height:43,paddingHorizontal:18,borderRadius:10,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",marginTop:5},openButtonText:{color:colors.primaryDark,fontSize:10,fontWeight:"900"},card:{backgroundColor:colors.surfaceLow,borderRadius:15,padding:15,gap:8,borderTopWidth:1,borderTopColor:colors.primary,boxShadow:"0 10px 22px rgba(0,0,0,.25)"},cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},status:{backgroundColor:"rgba(0,245,155,.11)",paddingHorizontal:9,paddingVertical:5,borderRadius:10},statusText:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,fontWeight:"800"},code:{color:colors.outline,fontFamily:Fonts.mono,fontSize:8},protocolName:{color:colors.text,fontSize:18,fontWeight:"800",marginTop:3},date:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:8},divider:{height:StyleSheet.hairlineWidth,backgroundColor:colors.surfaceHigh,marginVertical:4},dataGrid:{flexDirection:"row",gap:7},dataItem:{flex:1,backgroundColor:colors.surface,padding:9,borderRadius:9},dataLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:7},dataValue:{color:colors.text,fontFamily:Fonts.mono,fontSize:11,fontWeight:"800",marginTop:4},dataValueAccent:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:11,fontWeight:"800",marginTop:4},notes:{backgroundColor:colors.surfaceLowest,borderRadius:9,padding:10,gap:5,marginTop:3},note:{color:colors.textSecondary,fontSize:10,lineHeight:15},
});
