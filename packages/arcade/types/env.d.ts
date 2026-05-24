declare const __APP_VERSION__: string;
declare const __BRUFF_TEST_MODE__: boolean;

interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
