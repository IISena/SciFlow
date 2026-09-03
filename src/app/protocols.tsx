import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BioHeader, BottomNav, Chip } from "@/components/bio-shell";
import { cfsProtocolShortcut } from "@/constants/cfs-protocol";
import { colors, Fonts } from "@/constants/theme";
import { saveLastVisitedProtocol } from "@/services/storage";

const protocols = [
  { id:"cfs", code:"PRT-001", badge:"EM EXECUÇÃO", name:"Produção de Sobrenadante (CFS)", description:"Isolamento e purificação de metabólitos secundários bioativos livres de células bacterianas.", info:"10.000 RPM  •  4°C", target:"Xenorhabdus spp.", time:"48 horas", available:true },
  { id:"inhibition", code:"PRT-002", badge:"PADRONIZADO", name:"Ensaio de Inibição Micelial", description:"Quantificação do raio radial fúngico em meio BDA com discos antimicrobianos sob temperatura controlada.", info:"Taxa de inibição média: 84,2%", target:"S. sclerotiorum", time:"120 horas" },
  { id:"vocs", code:"PRT-003", badge:"VOLÁTEIS", name:"Análise de Voláteis (VOCs)", description:"Avaliação do efeito fungistático via metabólitos orgânicos voláteis sem contato físico micelial.", info:"Placa dupla compartimentada", target:"Técnica experimental", time:"72 horas" },
  { id:"seeds", code:"PRT-004", badge:"VALIDADO", name:"Bioinoculação de Sementes", description:"Aderência microbiológica em tegumento vegetal com agentes osmoprotetores e vigor pós-emergência.", info:"Casa de vegetação / Soja", target:"Lote #2024-B9", time:"14 dias" },
];

export default function ProtocolsScreen(){
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("Todos");
  const list=useMemo(()=>protocols.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())),[search]);
  const open=async(id:string,available?:boolean)=>{
    if (!available) {
      Alert.alert("Protocolo catalogado","A execução guiada deste protocolo será disponibilizada em uma próxima versão.");
      return;
    }
    await saveLastVisitedProtocol(cfsProtocolShortcut);
    router.push("/protocols/cfs");
  };
  return <View style={s.screen}><BioHeader/><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.titleRow}><View><Text selectable style={s.title}>Biblioteca de Protocolos</Text><Text style={s.subtitle}>24 ASSAYS CATALOGADOS • ATUALIZADO HOJE</Text></View><Text style={s.history}>◷</Text></View>
    <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} style={s.search} placeholder="Buscar protocolo, cepa ou técnica..." placeholderTextColor={colors.outline}/></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{["Todos","Metabólitos","Antifúngicos","Triagem","Biocontrole"].map(x=><Pressable key={x} onPress={()=>setFilter(x)}><Chip active={filter===x}>{x}{x==="Todos"?"  24":""}</Chip></Pressable>)}</ScrollView>
    {list.map((p,index)=><Pressable key={p.id} onPress={()=>void open(p.id,p.available)} style={[s.card,index===0&&s.featured]}>
      <View style={s.cardTop}><View style={s.badges}><View style={s.codeBadge}><Text style={s.code}>{p.code}</Text></View><View style={[s.typeBadge,index===0&&s.liveBadge]}><Text style={[s.type,index===0&&s.live]}>{p.badge}</Text></View></View><Text style={s.more}>•••</Text></View>
      <Text selectable style={s.name}>{p.name}</Text><Text style={s.description}>{p.description}</Text>
      <View style={s.tech}><Text style={s.techText}>⚙  {p.info}</Text></View>
      <View style={s.dataRow}><View><Text style={s.dataLabel}>CEPA-ALVO</Text><Text style={s.dataValue}>{p.target}</Text></View><View><Text style={s.dataLabel}>TEMPO DE ENSAIO</Text><Text style={s.dataValue}>◷  {p.time}</Text></View></View>
      <Pressable style={index===0?s.execute:s.open} onPress={()=>void open(p.id,p.available)}><Text style={index===0?s.executeText:s.openText}>{index===0?"▶  Ver Detalhes / Executar":"Abrir  →"}</Text></Pressable>
    </Pressable>)}
    <View style={s.newCard}><View><Text style={s.newTitle}>⊕  Novo Protocolo</Text><Text style={s.description}>Crie pipelines e etapas personalizadas</Text></View><Pressable style={s.create} onPress={()=>Alert.alert("Em breve","O editor de protocolos chegará em uma próxima versão.")}><Text style={s.createText}>Criar +</Text></Pressable></View>
  </ScrollView><BottomNav active="protocols"/></View>;
}
const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:110,gap:13},titleRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},title:{color:colors.text,fontSize:23,fontWeight:"800"},subtitle:{color:colors.primarySoft,fontFamily:Fonts.mono,fontSize:8,marginTop:5,letterSpacing:.5},history:{color:colors.primarySoft,fontSize:25},searchBox:{height:48,backgroundColor:colors.surfaceLow,borderRadius:12,flexDirection:"row",alignItems:"center",paddingHorizontal:14,borderWidth:1,borderColor:colors.surfaceHigh},searchIcon:{color:colors.primarySoft,fontSize:22},search:{flex:1,color:colors.text,fontSize:12,paddingHorizontal:10},filters:{gap:8,paddingVertical:2},card:{backgroundColor:colors.surfaceLow,borderRadius:15,padding:15,gap:11,boxShadow:"0 12px 25px rgba(0,0,0,.26)"},featured:{borderWidth:1,borderColor:"rgba(0,245,155,.35)"},cardTop:{flexDirection:"row",justifyContent:"space-between"},badges:{flexDirection:"row",gap:7},codeBadge:{backgroundColor:"rgba(0,245,155,.12)",paddingHorizontal:8,paddingVertical:5,borderRadius:5},code:{color:colors.primarySoft,fontFamily:Fonts.mono,fontWeight:"800",fontSize:9},typeBadge:{backgroundColor:colors.surfaceHigh,paddingHorizontal:8,paddingVertical:5,borderRadius:10},liveBadge:{backgroundColor:"rgba(144,24,34,.45)"},type:{color:colors.textSecondary,fontFamily:Fonts.mono,fontSize:8,fontWeight:"700"},live:{color:colors.secondary},more:{color:colors.outline},name:{color:colors.text,fontSize:18,fontWeight:"800"},description:{color:colors.textSecondary,fontSize:11,lineHeight:17},tech:{backgroundColor:colors.surface,padding:10,borderRadius:9},techText:{color:colors.text,fontFamily:Fonts.mono,fontSize:10},dataRow:{flexDirection:"row",justifyContent:"space-between",gap:12},dataLabel:{color:colors.outline,fontFamily:Fonts.mono,fontSize:8,marginBottom:3},dataValue:{color:colors.text,fontFamily:Fonts.mono,fontSize:10,fontWeight:"700"},execute:{backgroundColor:colors.primary,height:43,borderRadius:10,alignItems:"center",justifyContent:"center"},executeText:{color:colors.primaryDark,fontWeight:"900",fontSize:11},open:{alignSelf:"flex-end",backgroundColor:colors.surfaceHigh,paddingHorizontal:16,paddingVertical:10,borderRadius:9},openText:{color:colors.primarySoft,fontWeight:"800",fontSize:10},newCard:{backgroundColor:colors.surface,padding:15,borderRadius:14,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},newTitle:{color:colors.text,fontSize:15,fontWeight:"800"},create:{backgroundColor:colors.primary,paddingHorizontal:15,paddingVertical:11,borderRadius:9},createText:{color:colors.primaryDark,fontWeight:"900"}
});
