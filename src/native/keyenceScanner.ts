import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export type KeyenceScanEvent = {
  data: string;
  codeType: string;
  result: string;
  timestamp: number;
};

type InitializeResult = {
  ready: boolean;
  status: string;
};

type KeyenceScannerNativeModule = {
  initialize(): Promise<InitializeResult>;
  startRead(): Promise<string>;
  stopRead(): Promise<boolean>;
  isReading(): Promise<boolean>;
  release(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
};

const nativeScanner = NativeModules.KeyenceScanner as
  | KeyenceScannerNativeModule
  | undefined;

const requireScanner = (): KeyenceScannerNativeModule => {
  if (Platform.OS !== 'android' || !nativeScanner) {
    throw new Error('KEYENCE scanner hanya tersedia pada build Android native');
  }
  return nativeScanner;
};

export const keyenceScanner = {
  isAvailable: Platform.OS === 'android' && Boolean(nativeScanner),
  initialize: () => requireScanner().initialize(),
  startRead: () => requireScanner().startRead(),
  stopRead: () => requireScanner().stopRead(),
  isReading: () => requireScanner().isReading(),
  release: () => requireScanner().release(),
  subscribe: (listener: (event: KeyenceScanEvent) => void) => {
    const scanner = requireScanner();
    const emitter = new NativeEventEmitter(scanner);
    const subscription = emitter.addListener('KeyenceScan', listener);
    return () => subscription.remove();
  },
};
