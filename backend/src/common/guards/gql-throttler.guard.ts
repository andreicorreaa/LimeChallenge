import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    // Fall back to switchToHttp if GQL request/response isn't present
    const req = ctx?.req || context.switchToHttp().getRequest();
    const res = ctx?.res || context.switchToHttp().getResponse();

    return { req, res };
  }
}
