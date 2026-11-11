import heroScreen from './assets/c39-hero-c08-screen.png';
import heroPhoto from './assets/c39-hero-tucson-foothills.jpg';
import './_hero.css';

/**
 * Marketing hero for C39 landing (which now also carries the C01 welcome) (Figma placeholder: "phone showing the HouseCue home dashboard
 * over a Tucson home"). Photo: homes in the Tucson foothills by JC Cervantes on Unsplash (free licence),
 * https://unsplash.com/photos/a-house-on-a-hill-with-a-view-of-the-city-g7MszM0Pff4
 * Phone screen: screenshot of this prototype's C08 Home dashboard (mobile, light).
 * Not a screen: the registry ignores files that don't start with a screen code.
 */
export function HeroImage({ height, className }: { height: number | string; className?: string }) {
  return (
    <div className={['hc-hero-photo', className].filter(Boolean).join(' ')} style={{ height }}>
      <img className="hc-hero-photo__bg" src={heroPhoto} alt="" />
      <div className="hc-hero-photo__phone">
        <img src={heroScreen} alt="The HouseCue home dashboard on a phone, over homes in the Tucson foothills" />
      </div>
    </div>
  );
}
