"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const env_validation_js_1 = require("./config/env.validation.js");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const jwt_auth_guard_js_1 = require("./common/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("./common/guards/roles.guard.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
const users_module_js_1 = require("./modules/users/users.module.js");
const events_module_js_1 = require("./modules/events/events.module.js");
const photos_module_js_1 = require("./modules/photos/photos.module.js");
const storage_module_js_1 = require("./modules/storage/storage.module.js");
const search_module_js_1 = require("./modules/search/search.module.js");
const orders_module_js_1 = require("./modules/orders/orders.module.js");
const favorites_module_js_1 = require("./modules/favorites/favorites.module.js");
const admin_module_js_1 = require("./modules/admin/admin.module.js");
const payments_module_js_1 = require("./modules/payments/payments.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validation_js_1.validate,
            }),
            prisma_module_js_1.PrismaModule,
            storage_module_js_1.StorageModule,
            auth_module_js_1.AuthModule,
            users_module_js_1.UsersModule,
            events_module_js_1.EventsModule,
            photos_module_js_1.PhotosModule,
            search_module_js_1.SearchModule,
            orders_module_js_1.OrdersModule,
            favorites_module_js_1.FavoritesModule,
            admin_module_js_1.AdminModule,
            payments_module_js_1.PaymentsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_js_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_js_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map