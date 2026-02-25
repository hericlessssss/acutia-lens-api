import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { EventsModule } from './modules/events/events.module.js';
import { PhotosModule } from './modules/photos/photos.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { FavoritesModule } from './modules/favorites/favorites.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    EventsModule,
    PhotosModule,
    SearchModule,
    OrdersModule,
    FavoritesModule,
    AdminModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
