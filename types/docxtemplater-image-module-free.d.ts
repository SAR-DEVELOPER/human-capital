declare module 'docxtemplater-image-module-free' {
  interface ImageOptions {
    centered?: boolean;
    getImage: (tagValue: string, tagName: string) => Uint8Array | Buffer | Promise<Uint8Array | Buffer>;
    getSize: (img: Buffer | Uint8Array, tagValue: string, tagName: string) => [number, number];
  }

  class ImageModule {
    constructor(options: ImageOptions);
  }

  export default ImageModule;
}

