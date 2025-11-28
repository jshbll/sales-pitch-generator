/**
 * Material UI v7 Helper Utilities
 * 
 * These utilities help with migrating from older Material UI versions to v7
 * by providing compatible props and patterns.
 */

import { SxProps, Theme } from '@mui/material/styles';

/**
 * Grid breakpoint configuration interface
 */
interface GridBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

/**
 * Creates Grid item props compatible with Material UI v7
 * 
 * In MUI v7, the Grid component API changed significantly.
 * Instead of using 'item' prop with 'xs', 'sm', 'md', etc.,
 * we now use the 'sx' prop with 'gridColumn' properties.
 * 
 * @param breakpoints - Either a number for xs or an object with breakpoint values
 * @param sm - Small screens (optional, used only when first param is a number)
 * @param md - Medium screens (optional, used only when first param is a number)
 * @param lg - Large screens (optional, used only when first param is a number)
 * @param xl - Extra large screens (optional, used only when first param is a number)
 * @returns SxProps object for use with Grid component
 * 
 * @example
 * // Using positional parameters
 * createGridItemProps(12, 6, 4)
 * 
 * // Using object syntax
 * createGridItemProps({ xs: 12, md: 6, lg: 4 })
 */
export function createGridItemProps(
  breakpoints: number | GridBreakpoints = 12,
  sm?: number,
  md?: number,
  lg?: number,
  xl?: number
): SxProps<Theme> {
  const gridColumnProps: Record<string, string> = {};
  
  if (typeof breakpoints === 'number') {
    // Handle the original signature with positional parameters
    gridColumnProps.xs = `span ${breakpoints}`;
    if (sm !== undefined) gridColumnProps.sm = `span ${sm}`;
    if (md !== undefined) gridColumnProps.md = `span ${md}`;
    if (lg !== undefined) gridColumnProps.lg = `span ${lg}`;
    if (xl !== undefined) gridColumnProps.xl = `span ${xl}`;
  } else {
    // Handle the object syntax
    if (breakpoints.xs !== undefined) gridColumnProps.xs = `span ${breakpoints.xs}`;
    if (breakpoints.sm !== undefined) gridColumnProps.sm = `span ${breakpoints.sm}`;
    if (breakpoints.md !== undefined) gridColumnProps.md = `span ${breakpoints.md}`;
    if (breakpoints.lg !== undefined) gridColumnProps.lg = `span ${breakpoints.lg}`;
    if (breakpoints.xl !== undefined) gridColumnProps.xl = `span ${breakpoints.xl}`;
  }
  
  return {
    gridColumn: gridColumnProps
  };
}
