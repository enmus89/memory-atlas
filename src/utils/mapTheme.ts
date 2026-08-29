// Shared color definitions between 2D Map and 3D Globe for Light and Dark modes
import { MapTheme } from '../types';

export interface MapPalette {
  // Atmosphere & Space / Ocean background
  oceanBg: string;
  globeOceanSphere: string; // The color of the 3D globe sphere (ocean beneath country polygons)
  gridDot: string;
  atmosphereColor: string;
  atmosphereAltitude: number;

  // Unvisited Countries (Distinctive unexplored landmass)
  unvisitedFill: string;
  unvisitedStroke: string;
  unvisitedSide: string;

  // Visited Countries (Vibrant explored territories)
  visitedFill: string;
  visitedStroke: string;
  visitedSide: string;
  visitedShadow: string;

  // Home Country Base
  homeFill: string;
  homeStroke: string;
  homeSide: string;

  // Active / Selected Country
  selectedFill: string;
  selectedStroke: string;
  selectedSide: string;

  // Hover Country
  hoverFill: string;
  hoverStroke: string;

  // Microstate Nodes
  microstateVisited: string;
  microstateUnvisited: string;
  microstateRingStroke: string;
  microstateBorder: string;

  // Flight Arcs
  flightArcGradient: [string, string];
  flightArcHover: [string, string];
  flightArcSelected: [string, string];
}

export const MAP_THEMES: Record<MapTheme, MapPalette> = {
  // LIGHT MAP: Exact original 2D map colors (soft sky ocean #e0f2fe) + Navy Blue #2C3259 3D globe ocean sphere
  light: {
    oceanBg: '#e0f2fe', // Soft sea blue (sky-100) canvas & background
    globeOceanSphere: '#2C3259', // Navy Blue #2C3259 for the 3D globe ocean sphere
    gridDot: '#93c5fd', // Soft blue dots
    atmosphereColor: '#38bdf8', // Sky atmospheric glow
    atmosphereAltitude: 0.18,

    // Unvisited: Classic slate-300
    unvisitedFill: '#cbd5e1',
    unvisitedStroke: '#94a3b8',
    unvisitedSide: 'rgba(148, 163, 184, 0.4)',

    // Visited: Vibrant travel blue (blue-600)
    visitedFill: '#2563eb',
    visitedStroke: '#1d4ed8',
    visitedSide: 'rgba(37, 99, 235, 0.55)',
    visitedShadow: 'rgba(37, 99, 235, 0.35)',

    // Home base: Warm amber
    homeFill: '#d97706',
    homeStroke: '#f59e0b',
    homeSide: 'rgba(217, 119, 6, 0.6)',

    // Selected: Cobalt blue with deep border
    selectedFill: '#3b82f6',
    selectedStroke: '#1e3a8a',
    selectedSide: 'rgba(59, 130, 246, 0.7)',

    // Hover
    hoverFill: '#60a5fa',
    hoverStroke: '#2563eb',

    // Microstates
    microstateVisited: '#2563eb',
    microstateUnvisited: '#94a3b8',
    microstateRingStroke: '#2563eb',
    microstateBorder: '#ffffff',

    // Flight paths
    flightArcGradient: ['rgba(37, 99, 235, 0.95)', 'rgba(59, 130, 246, 0.85)'],
    flightArcHover: ['#f59e0b', '#2563eb'],
    flightArcSelected: ['#f59e0b', '#3b82f6']
  },

  // DARK MAP: Improved high-contrast distinctive colors for visited vs unexplored
  dark: {
    oceanBg: '#090d16', // Deep midnight navy space/ocean
    globeOceanSphere: '#090d16', // Deep midnight ocean for 3D Globe
    gridDot: '#1e293b', // Muted grid dots
    atmosphereColor: '#3b82f6', // Sapphire atmospheric halo
    atmosphereAltitude: 0.22,

    // Unexplored / Unvisited: Distinct crisp charcoal slate (slate-700) with clear borders
    unvisitedFill: '#334155',
    unvisitedStroke: '#475569',
    unvisitedSide: 'rgba(51, 65, 85, 0.5)',

    // Visited: Luminous electric travel blue (blue-500) that shines distinctly against dark slate
    visitedFill: '#2563eb',
    visitedStroke: '#93c5fd', // Luminous light blue border
    visitedSide: 'rgba(37, 99, 235, 0.65)',
    visitedShadow: 'rgba(59, 130, 246, 0.6)',

    // Home base: Rich warm amber-gold
    homeFill: '#d97706',
    homeStroke: '#fbbf24',
    homeSide: 'rgba(217, 119, 6, 0.7)',

    // Selected: Glowing sky blue with high-contrast white border
    selectedFill: '#0284c7',
    selectedStroke: '#ffffff',
    selectedSide: 'rgba(2, 132, 199, 0.75)',

    // Hover: Bright highlight
    hoverFill: '#38bdf8',
    hoverStroke: '#ffffff',

    // Microstates
    microstateVisited: '#3b82f6',
    microstateUnvisited: '#64748b',
    microstateRingStroke: '#93c5fd',
    microstateBorder: '#0f172a',

    // Flight paths: Luminous cyan/gold arcs
    flightArcGradient: ['rgba(56, 189, 248, 0.95)', 'rgba(129, 140, 248, 0.85)'],
    flightArcHover: ['#fbbf24', '#38bdf8'],
    flightArcSelected: ['#f59e0b', '#60a5fa']
  }
};
