import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const startAt = Date.now();
    const originalSend = res.send.bind(res);

    res.send = (body: unknown) => {
      const ms = Date.now() - startAt;
      res.setHeader('X-Response-Time', `${ms} ms`);
      console.log(ms + 'ms')
      return originalSend(body);
    };

    next();


  }
}
