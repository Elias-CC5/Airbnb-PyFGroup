import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Filtro global: normaliza TODAS las respuestas de error de la API
 * y evita filtrar detalles internos en producción.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Ocurrió un error inesperado';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else {
        const body = res as Record<string, unknown>;
        message = (body.message as string | string[]) ?? exception.message;
        error = (body.error as string) ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, error } = mapPrismaError(exception));
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} → ${status}`, JSON.stringify(message));
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}

function mapPrismaError(e: Prisma.PrismaClientKnownRequestError) {
  switch (e.code) {
    case 'P2002': {
      const fields = (e.meta?.target as string[] | undefined)?.join(', ') ?? 'campo';
      return {
        status: HttpStatus.CONFLICT,
        message: `Ya existe un registro con ese valor (${fields})`,
        error: 'Conflict',
      };
    }
    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'El recurso solicitado no existe',
        error: 'Not Found',
      };
    case 'P2003':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Referencia inválida a otro recurso',
        error: 'Bad Request',
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error de base de datos',
        error: 'Internal Server Error',
      };
  }
}
