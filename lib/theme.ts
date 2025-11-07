"use client";
/**
 * Theme Configuration for Material-UI
 * This file defines the custom theme settings for the application, including:
 * - Custom color palette extensions
 * - Base colors and custom color configurations
 * - Typography settings
 * - Responsive breakpoints
 */
import { createTheme, PaletteOptions, Theme } from "@mui/material/styles";

/**
 * Type Extensions for Material-UI Theme
 * Extends the default palette to support custom color definitions
 */
declare module "@mui/material/styles" {
  // Define structure for custom color entries
  interface CustomPaletteColor {
    main: string; // Primary color value
    light?: string; // Lighter variant
    dark?: string; // Darker variant
    contrastText?: string; // Text color to use against this background
  }

  // Add custom colors to the main Palette interface
  interface Palette {
    custom: {
      [key: string]: CustomPaletteColor;
    };
  }

  // Add custom colors to PaletteOptions for theme creation
  interface PaletteOptions {
    custom?: {
      [key: string]: Partial<CustomPaletteColor>;
    };
  }
}

/**
 * Base Color Definitions
 * Central source of truth for core application colors
 * Includes both legacy and new vibrant blue/orange palette for smooth migration
 */
const baseColors = {
  // LEGACY COLORS - Keep for backward compatibility
  lightGrayLegacy: "#A5A5A5", // Legacy primary color
  darkGrayLegacy: "#595758", // Legacy secondary color
  flameLegacy: "#FFD30D", // Legacy accent color
  activeGreenLegacy: "#7fff00", // Legacy active/success states
  backgroundLegacy: "#EFEFEF", // Legacy main background
  paperLegacy: "#f5f5f5", // Legacy surface color
  offWhiteLegacy: "#efe3d6", // Legacy warmer white

  // NEW VIBRANT COLORS - Blue variations (primary color family)
  deepBlue: "#1e3a8a", // Deep blue for primary elements and headers
  royalBlue: "#3b82f6", // Bright blue for interactive elements
  skyBlue: "#60a5fa", // Light blue for hover states and accents
  lightBlue: "#dbeafe", // Very light blue for subtle backgrounds

  // Orange variations - accent color family
  burntOrange: "#ea580c", // Deep orange for important actions and alerts
  vibrantOrange: "#f97316", // Bright orange for CTAs and highlights
  lightOrange: "#fed7aa", // Light orange for warm backgrounds
  paleOrange: "#fff7ed", // Very light orange for subtle accents

  // Neutral colors
  charcoal: "#374151", // Dark neutral for text and strong contrast
  slate: "#64748b", // Medium neutral for secondary text
  lightGray: "#f1f5f9", // Light neutral for backgrounds
  white: "#ffffff", // Pure white for maximum contrast
  black: "#000000", // Pure black for maximum contrast

  // Background and surface colors
  background: "#fafafa", // Main application background - very light gray
  paper: "#ffffff", // Surface color for cards and elevated elements

  // State colors
  successGreen: "#10b981", // Success states and confirmations
  warningAmber: "#f59e0b", // Warning states
  errorRed: "#ef4444", // Error states
} as const;

/**
 * Custom Color Configurations
 * Defines complex color objects with main colors and contrast text
 * Includes both legacy and new color schemes for gradual migration
 */
const customColors = {
  // LEGACY CUSTOM COLORS - Keep for backward compatibility
  flame: {
    main: baseColors.flameLegacy,
    contrastText: baseColors.darkGrayLegacy,
  },
  oval: {
    main: "#53504C", // Original warm dark gray/brown
    contrastText: "#ffffff",
  },
  activeOval: {
    main: "#32AE38", // Original forest green for active states
    contrastText: "#ffffff",
  },
  offWhite: {
    main: baseColors.offWhiteLegacy,
    contrastText: baseColors.black,
  },

  // NEW VIBRANT CUSTOM COLORS
  accent: {
    main: baseColors.vibrantOrange,
    light: baseColors.lightOrange,
    dark: baseColors.burntOrange,
    contrastText: baseColors.white,
  },
  primary: {
    main: baseColors.royalBlue,
    light: baseColors.skyBlue,
    dark: baseColors.deepBlue,
    contrastText: baseColors.white,
  },
  active: {
    main: baseColors.successGreen,
    contrastText: baseColors.white,
  },
  warning: {
    main: baseColors.warningAmber,
    contrastText: baseColors.charcoal,
  },
  surface: {
    main: baseColors.lightBlue,
    contrastText: baseColors.deepBlue,
  },
  warmSurface: {
    main: baseColors.paleOrange,
    contrastText: baseColors.burntOrange,
  },
} as const;

/**
 * Main Theme Configuration
 * Creates and exports the Material-UI theme with custom settings
 */
const theme = createTheme({
  palette: {
    mode: "light",
    // LEGACY THEME SETTINGS - Keep existing pages working
    primary: {
      main: baseColors.lightGrayLegacy,
      contrastText: "#2b2a2a",
    },
    secondary: {
      main: baseColors.darkGrayLegacy,
      contrastText: baseColors.white,
    },
    background: {
      default: baseColors.backgroundLegacy,
      paper: baseColors.paperLegacy,
    },
    text: {
      primary: baseColors.darkGrayLegacy,
      secondary: baseColors.darkGrayLegacy,
    },
    error: {
      main: baseColors.errorRed,
      contrastText: baseColors.white,
    },
    warning: {
      main: baseColors.warningAmber,
      contrastText: baseColors.charcoal,
    },
    success: {
      main: baseColors.successGreen,
      contrastText: baseColors.white,
    },
    custom: customColors,
  },
  typography: {
    fontFamily: [
      "Inter", // Modern, clean primary font
      "Arial", // Widely available fallback
      "sans-serif", // System fallback for maximum compatibility
    ].join(","),
  },
  breakpoints: {
    values: {
      xs: 0, // Extra small devices (phones)
      sm: 600, // Small devices (tablets)
      md: 900, // Medium devices (small laptops)
      lg: 1200, // Large devices (laptops/desktops)
      xl: 1536, // Extra large devices (large desktops)
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: baseColors.darkGrayLegacy,
            borderWidth: 2,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: baseColors.darkGrayLegacy,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: baseColors.darkGrayLegacy,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: `${baseColors.lightBlue}`,
          },
          "&.Mui-selected": {
            backgroundColor: `${baseColors.skyBlue}30`,
            "&:hover": {
              backgroundColor: `${baseColors.skyBlue}50`,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: baseColors.slate,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: baseColors.charcoal,
        },
        secondary: {
          color: baseColors.slate,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: baseColors.deepBlue,
          backgroundColor: baseColors.lightBlue,
        },
        body: {
          color: baseColors.charcoal,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            "& .MuiSvgIcon-root": {
              filter: `drop-shadow(0 0 2px ${baseColors.royalBlue})`,
            },
          },
          color: baseColors.slate,
          "&.Mui-checked": {
            color: baseColors.royalBlue,
            "& .MuiSvgIcon-root": {
              filter: "none",
            },
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: baseColors.slate,
          "&.Mui-checked": {
            color: baseColors.royalBlue,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-track": {
            backgroundColor: baseColors.lightGray,
          },
          "& .MuiSwitch-thumb": {
            backgroundColor: baseColors.slate,
          },
          "& .Mui-checked": {
            "& .MuiSwitch-thumb": {
              backgroundColor: baseColors.royalBlue,
            },
            "& + .MuiSwitch-track": {
              backgroundColor: `${baseColors.skyBlue}80`,
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: baseColors.slate,
          "&:hover": {
            backgroundColor: baseColors.lightBlue,
            color: baseColors.royalBlue,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderColor: baseColors.lightGray,
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: baseColors.deepBlue,
          color: baseColors.white,
        },
        arrow: {
          color: baseColors.deepBlue,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: baseColors.lightGray,
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: baseColors.vibrantOrange,
        },
        iconEmpty: {
          color: baseColors.lightGray,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.lightBlue,
          color: baseColors.deepBlue,
        },
        outlined: {
          borderColor: baseColors.royalBlue,
          color: baseColors.royalBlue,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
        },
        outlined: {
          borderColor: baseColors.royalBlue,
          color: baseColors.royalBlue,
          "&:hover": {
            borderColor: baseColors.deepBlue,
            backgroundColor: baseColors.lightBlue,
            color: baseColors.deepBlue,
          },
        },
        contained: {
          backgroundColor: baseColors.royalBlue,
          color: baseColors.white,
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
          "&:hover": {
            backgroundColor: baseColors.deepBlue,
            boxShadow: "0 4px 12px rgba(30, 58, 138, 0.4)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label.Mui-focused": {
            color: baseColors.royalBlue,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: baseColors.royalBlue,
          },
          color: baseColors.slate,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: baseColors.slate,
          "&.Mui-selected": {
            color: baseColors.royalBlue,
            fontWeight: 600,
          },
          "&:hover": {
            color: baseColors.royalBlue,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: baseColors.slate,
          borderColor: baseColors.lightGray,
          "&.Mui-selected": {
            backgroundColor: baseColors.lightBlue,
            color: baseColors.deepBlue,
            borderColor: baseColors.royalBlue,
          },
          "&:hover": {
            backgroundColor: baseColors.lightBlue,
          },
        },
      },
    },
  },
});

/**
 * Type-safe Custom Color Accessor
 * @param colorName - The name of the custom color to retrieve
 * @returns The custom color object with main color and contrast text
 */
export const getCustomColor = (colorName: keyof typeof customColors) => {
  return theme.palette.custom[colorName];
};

/**
 * NEW VIBRANT THEME - Use this for new pages/components
 * Creates a theme with the new blue and orange color palette
 */
export const createNewTheme = () => createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    primary: {
      main: baseColors.royalBlue,
      light: baseColors.skyBlue,
      dark: baseColors.deepBlue,
      contrastText: baseColors.white,
    },
    secondary: {
      main: baseColors.vibrantOrange,
      light: baseColors.lightOrange,
      dark: baseColors.burntOrange,
      contrastText: baseColors.white,
    },
    background: {
      default: baseColors.background,
      paper: baseColors.paper,
    },
    text: {
      primary: baseColors.charcoal,
      secondary: baseColors.slate,
    },
  },
});

/**
 * MIGRATION GUIDE:
 * 
 * 1. For existing pages: Continue using the default theme export
 * 2. For new pages: Use createNewTheme() to get the vibrant blue/orange theme
 * 3. Individual colors available in baseColors:
 *    - Legacy: lightGrayLegacy, darkGrayLegacy, flameLegacy, etc.
 *    - New: royalBlue, deepBlue, vibrantOrange, burntOrange, etc.
 * 4. Custom colors available in customColors:
 *    - Legacy: flame, oval, activeOval, offWhite
 *    - New: accent, primary, active, warning, surface, warmSurface
 * 
 * Example usage in a new component:
 * import { ThemeProvider } from '@mui/material/styles';
 * import { createNewTheme } from './theme';
 * 
 * function NewComponent() {
 *   return (
 *     <ThemeProvider theme={createNewTheme()}>
 *       // Your component content
 *     </ThemeProvider>
 *   );
 * }
 */

export { baseColors, customColors };
export default theme;

