import { Injectable } from '@nestjs/common'

@Injectable()
export class EmployeeLoggerService {

    log(message: string): void {
        console.log(`[EmployeeLogger] ${message}`)
    }
}
