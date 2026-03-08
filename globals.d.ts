/** TypeScript용 CSS 모듈 선언 (React-Quill 등) */
declare module "react-quill/dist/quill.snow.css";

/** 네이버 지도 API (maps.js v3) */
declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (el: HTMLElement | string, options: { center: unknown; zoom?: number }) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: { position: unknown; map: unknown; title?: string }) => unknown;
        Event: { addListener: (target: unknown, event: string, handler: () => void) => void };
        Service: {
          geocode: (options: { address: string }, callback: (status: number, response: { result: { items: Array<{ point: { x: number; y: number } }> } }) => void) => void;
        };
      };
    };
  }
}
export {};
