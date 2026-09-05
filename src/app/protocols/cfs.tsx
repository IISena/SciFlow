import { Redirect } from "expo-router";
// Preserve existing bookmarks while only offering the new protocol.
export default function PreviousProtocolRoute() { return <Redirect href="/protocols/cim-cbm" />; }
