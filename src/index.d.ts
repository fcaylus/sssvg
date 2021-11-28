/**
 * Options provided to optimizeSVG()
 */
export interface SSSVGOptions {
    /**
     * If true, will crop the SVG to its content, based on the backgroundColor property
     */
    crop?: boolean;
    /**
     * Background color use to detect the background and the content.
     * Should be 'default', 'transparent', a HTML color name or an hex string.
     * If not specified, default to 'default', which will detect white and transparent backgrounds.
     */
    backgroundColor?: 'default' | 'transparent' | string;
    /**
     * If specified, will change the SVG viewBox to match the provided value.
     * If a value is omitted, the aspect ratio will be preserved, and the SVG will resize based on the other values.
     */
    viewBox?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }
}

/**
 * Optimize a SVG and apply transformations based on the provided options
 * @param filePath The SVG file path
 * @param svg The SVG file content
 * @param options Options
 */
export function optimizeSVG(filePath: string, svg: string, options?: SSSVGOptions): Promise<string>;

/**
 * Analysis results returned by the analyzeSVG() function
 */
export interface SvgAnalysis {
    /**
     * List of colors found in the SVG
     */
    colors: string[];
    /**
     * Parsed view box
     */
    viewBox: {
        x: number;
        y: number;
        width: number;
        height: number;
        /** Ratio of width/height */
        ratio: number;
    };
    /**
     * True if the SVG contains raster images (<image> or <img> elements)
     */
    containsRasterImage: boolean;
    /**
     * True if the SVG contains raw text (<text> element)
     */
    containsText: boolean;
}

/**
 * Analyze a SVG string and returns information about its size and features
 * @param svg The SVG content (as string)
 */
export function analyzeSVG(svg: string): SvgAnalysis;
