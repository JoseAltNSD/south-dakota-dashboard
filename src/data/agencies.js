// Agencies behind the SLDS. The Department of Education leads; the boards are partners.
// `tone` is the logo file's own coloring: 'white' (knockout, for the red footer) or 'color'.
// `matte: true` marks a file with a solid white background instead of transparency.
// AgencyLogos recolors with a CSS filter where a matching official version is still missing.
import doeLogo from '../assets/sd-doe-logo-white.png';
import borLogo from '../assets/sd-board-of-regents.webp';
import bteLogo from '../assets/sd-board-of-technical-education.png';
import collaborativeLogo from '../assets/sd-data-collaborative.svg';

// The program the dashboard belongs to. Shown before the agencies, in full color on light backgrounds.
// The file is cut from the branding guide PDF; replace it with the official artwork when it arrives.
export const PROGRAM = {
  name: 'South Dakota Data Collaborative',
  logo: collaborativeLogo,
  tone: 'color',
  alt: 'South Dakota Data Collaborative: Classroom to Career Connections',
};

export const LEAD = {
  name: 'South Dakota Department of Education',
  logo: doeLogo,
  tone: 'white',
  alt: 'South Dakota Department of Education: Learning. Leadership. Service.',
};

export const PARTNERS = [
  { name: 'South Dakota Board of Regents', logo: borLogo, tone: 'white', alt: 'South Dakota Board of Regents' },
  { name: 'South Dakota Board of Technical Education', logo: bteLogo, tone: 'color', matte: true, alt: 'South Dakota Board of Technical Education' },
];
