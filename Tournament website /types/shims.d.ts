// Minimal shims to keep TypeScript happy without full @types packages installed.
// These do not affect runtime; they only relax type checking during compilation.

// React module and JSX global namespace
declare module 'react' {
  const ReactDefault: any
  export default ReactDefault
  export const useState: any
  export const useEffect: any
  export const useMemo: any
  export const useCallback: any
  export const useRef: any
  export const createElement: any
  export const Fragment: any
}

// Allow any JSX intrinsic elements like <div/>, <span/>, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

// lucide-react icon exports used in the codebase
declare module 'lucide-react' {
  export const Plus: any
  export const Trash2: any
  export const Edit: any
  export const Users: any
  export const Calendar: any
  export const DollarSign: any
  export const Shield: any
  export const Crown: any
  export const Settings: any
  export const Trophy: any
  export const Save: any
}
