// scripts/generate-openapi.ts
// Genera openapi.json a partir del código real de la API.
// Uso: npm run generate:openapi
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Bl-GAE API')
    .setDescription('API de resultados de Baloto y Revancha (Colombia)')
    .setVersion('1.0')
    .addTag('baloto', 'Resultados, histórico y verificación de jugadas de Baloto')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(document, null, 2), 'utf8');

  await app.close();
  console.log('✅ openapi.json generado correctamente');
}

generateOpenApi().catch((err) => {
  console.error('❌ Error generando openapi.json:', err);
  process.exit(1);
});