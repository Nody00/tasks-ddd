import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.set('trust proxy', true);
    app.useGlobalFilters(new DomainExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    const config = new DocumentBuilder()
        .setTitle('Everything API')
        .setDescription('API for Practise application')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use('/reference', apiReference({ content: document }));
    await app.listen(process.env.PORT ?? 3000);

    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(
        `API documentation available at: ${await app.getUrl()}/reference`,
    );
}
bootstrap().catch((error) => {
    console.error('Error starting the application:', error);
    process.exit(1);
});
