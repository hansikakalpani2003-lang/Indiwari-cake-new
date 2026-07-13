/** * LandingPage.jsx 
 * Public marketing home page — route: "/" 
 * Replaces the temporary placeholder created in M3. 
 * * Composition: Navbar → HeroSection → FeaturesSection → MenuPreview 
 * → HowItWorks → Footer 
 */
import Navbar          from '../components/common/Navbar';
import Footer           from '../components/common/Footer';
import HeroSection      from '../components/landing/HeroSection';
import FeaturesSection  from '../components/landing/FeaturesSection';
import MenuPreview      from '../components/landing/MenuPreview';
import HowItWorks       from '../components/landing/HowItWorks';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <MenuPreview />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;