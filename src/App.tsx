import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import FatigueAnalysisScreen from './screens/FatigueAnalysisScreen';
import SNCurveScreen from './screens/SNCurveScreen';
import DetailCategoriesScreen from './screens/DetailCategoriesScreen';
import DamageAccumulationScreen from './screens/DamageAccumulationScreen';
import QuickCheckScreen from './screens/QuickCheckScreen';
import ReferenceScreen from './screens/ReferenceScreen';
import AppBar from './components/AppBar';

type Screen = 'home' | 'fatigue-analysis' | 'sn-curve' | 'detail-categories' | 'damage-accumulation' | 'quick-check' | 'reference';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'fatigue-analysis':
        return <FatigueAnalysisScreen onBack={goHome} />;
      case 'sn-curve':
        return <SNCurveScreen onBack={goHome} />;
      case 'detail-categories':
        return <DetailCategoriesScreen onBack={goHome} />;
      case 'damage-accumulation':
        return <DamageAccumulationScreen onBack={goHome} />;
      case 'quick-check':
        return <QuickCheckScreen onBack={goHome} />;
      case 'reference':
        return <ReferenceScreen onBack={goHome} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <AppBar
          title="IRS Steel Bridge Code"
          subtitle="Fatigue Analysis Calculator"
        />
      </div>
      <div className="p-4 pt-6">
        {renderScreen()}
      </div>
    </div>
  );
}
