/**
 * Ambient type declarations for graphql-upload ESM sub-path exports.
 * graphql-upload v16+ ships as pure ESM (.mjs) without bundled .d.ts files.
 *
 * NOTE: No top-level imports here — they would make this a module and break
 * the global ambient `declare module` blocks.
 */

declare module 'graphql-upload/GraphQLUpload.mjs' {
  import type { GraphQLScalarType } from 'graphql';
  const GraphQLUpload: GraphQLScalarType;
  export default GraphQLUpload;
}

declare module 'graphql-upload/graphqlUploadExpress.mjs' {
  import type { RequestHandler } from 'express';
  interface UploadOptions {
    maxFieldSize?: number;
    maxFileSize?: number;
    maxFiles?: number;
  }
  function graphqlUploadExpress(options?: UploadOptions): RequestHandler;
  export default graphqlUploadExpress;
}
