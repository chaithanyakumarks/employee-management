import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'

@Injectable()
export class UtilsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const response = context.switchToHttp().getResponse()
    const responseCode = response.statusCode ?? 200
    const message = "Success"

    return next.handle().pipe(map(data => {
      return {
        statusCode: responseCode,
        message: message,
        data: data
      }
    }))
  }
}
