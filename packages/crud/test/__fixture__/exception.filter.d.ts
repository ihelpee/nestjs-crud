import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RequestQueryException } from '@ihelpee/crud-request';
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: RequestQueryException, host: ArgumentsHost): void;
}
