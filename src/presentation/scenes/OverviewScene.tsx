import {AssetTokens,Certificate,Station,type SceneProps} from '../components/AssetTokens';
import HederaNetwork from '../components/HederaNetwork';
import ComplianceGate from '../components/ComplianceGate';
export default function OverviewScene({reduced}:SceneProps){return <><HederaNetwork/><group position={[-1.9,.45,0]} scale={.65}><Certificate/></group><group position={[1.8,.3,0]} scale={1.1}><AssetTokens count={10}/></group><group position={[0,-.2,-.9]} scale={.7}><ComplianceGate open reduced={reduced}/></group><Station x={-2}/><Station x={2} color="#7acbdf"/></>;}
