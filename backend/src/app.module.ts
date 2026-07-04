import { join } from 'node:path';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { LoggerModule } from 'nestjs-pino';

import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { NotesModule } from './notes/notes.module';
import { PatientsModule } from './patients/patients.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    // ─── Configuration ────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    // 60 requests per minute per IP globally.
    // Individual resolvers can override with @Throttle() decorator.
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000, // 1 minute window (ms)
        limit: 60,
      },
    ]),

    // ─── Structured JSON Logger (CloudWatch-compatible) ───────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),

    // ─── PostgreSQL via TypeORM ───────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'scribe_db'),
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: true, // Dev only — use migrations in production
        logging: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),

    // ─── GraphQL (Code-First with Apollo) ────────────────────────────────────
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code-first: decorators generate the schema automatically
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Register Upload scalar from graphql-upload
      resolvers: { Upload: GraphQLUpload },
      // GraphQL Playground available at /graphql in development
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      // Pass HTTP request into GraphQL context (used by ThrottlerGuard)
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),

    // ─── Serve local uploads folder as static files ───────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // ─── Feature Modules ─────────────────────────────────────────────────────
    PatientsModule,
    NotesModule,
    AiModule,
    StorageModule,
    HealthModule,
    DatabaseModule,
  ],
  providers: [
    // Apply ThrottlerGuard globally to all resolvers and REST endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
