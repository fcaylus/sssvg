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
    backgroundColor: 'default' | 'transparent' | string;
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
