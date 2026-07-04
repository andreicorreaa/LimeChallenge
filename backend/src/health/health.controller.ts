import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Health check endpoint — REST (not GraphQL).
 * Required for AWS ECS/ALB and Docker Compose health checks.
 * Always exempt from rate limiting.
 */
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
