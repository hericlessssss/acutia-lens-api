import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ResponseShape<T> {
    data: T;
    statusCode: number;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ResponseShape<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ResponseShape<T>> {
        return next.handle().pipe(
            map((data) => ({
                data,
                statusCode: context.switchToHttp().getResponse().statusCode,
            })),
        );
    }
}
