export interface SSSVGOptions {
    crop?: boolean;
    viewBox?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }
}

export function optimizeSVG(filePath: string, svg: string, options: SSSVGOptions): Promise<string>;
